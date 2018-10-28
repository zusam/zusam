/*
 * Hermite resize - fast image resize/resample using Hermite filter.
 * https://github.com/viliusle/Hermite-resize
 * Reworked for Zusam: es6, from img to blob, wrapped in an object.
 */
const hermite = {
	workers_archive: [],
    
    // toBlob polyfill
    toBlob: (canvas, callback) => {
        if (HTMLCanvasElement.prototype.toBlob) {
            canvas.toBlob(callback);
            return;
        }
        // edge
        if (HTMLCanvasElement.prototype.msToBlob) {
            callback(canvas.msToBlob());
            return;
        }
        // safari
        const dataURL = canvas.toDataURL("image/png").split(",")[1];
        setTimeout(() => {
            const binStr = atob(dataURL), len = binStr.length, arr = new Uint8Array(len);
            for (let i = 0; i < len; i++ ) {
                arr[i] = binStr.charCodeAt(i);
            }
            callback(new Blob([arr], {type: "image/png"}));
        });
    },

	// Build a worker from an anonymous function body - purpose is to avoid separate file
	workerBlobURL: window.URL.createObjectURL(new Blob(['(',
        (() => {
			//begin worker
            onmessage = event => {
				let core = event.data.core;
				let width_source = event.data.width_source;
				let height_source = event.data.height_source;
				let width = event.data.width;
				let height = event.data.height;

				let ratio_w = width_source / width;
				let ratio_h = height_source / height;
				let ratio_w_half = Math.ceil(ratio_w / 2);
				let ratio_h_half = Math.ceil(ratio_h / 2);

				let source = new Uint8ClampedArray(event.data.source);
				let source_h = source.length / width_source / 4;
				let target_size = width * height * 4;
				let target_memory = new ArrayBuffer(target_size);
				let target = new Uint8ClampedArray(target_memory, 0, target_size);
				//calculate
				for (let j = 0; j < height; j++) {
					for (let i = 0; i < width; i++) {
						let x2 = (i + j * width) * 4;
						let weight = 0;
						let weights = 0;
						let weights_alpha = 0;
						let gx_r = 0;
						let gx_g = 0;
						let gx_b = 0;
						let gx_a = 0;
						let center_y = j * ratio_h;

						let xx_start = Math.floor(i * ratio_w);
						let xx_stop = Math.ceil((i + 1) * ratio_w);
						let yy_start = Math.floor(j * ratio_h);
						let yy_stop = Math.ceil((j + 1) * ratio_h);

						xx_stop = Math.min(xx_stop, width_source);
						yy_stop = Math.min(yy_stop, height_source);

						for (let yy = yy_start; yy < yy_stop; yy++) {
							let dy = Math.abs(center_y - yy) / ratio_h_half;
							let center_x = i * ratio_w;
							let w0 = dy * dy; //pre-calc part of w
							for (let xx = xx_start; xx < xx_stop; xx++) {
								let dx = Math.abs(center_x - xx) / ratio_w_half;
								let w = Math.sqrt(w0 + dx * dx);
								if (w >= 1) {
									//pixel too far
									continue;
								}
								//hermite filter
								weight = 2 * w * w * w - 3 * w * w + 1;
								//calc source pixel location
								let pos_x = 4 * (xx + yy * width_source);
								//alpha
								gx_a += weight * source[pos_x + 3];
								weights_alpha += weight;
								//colors
								if (source[pos_x + 3] < 255)
									weight = weight * source[pos_x + 3] / 250;
								gx_r += weight * source[pos_x];
								gx_g += weight * source[pos_x + 1];
								gx_b += weight * source[pos_x + 2];
								weights += weight;
							}
						}
						target[x2] = gx_r / weights;
						target[x2 + 1] = gx_g / weights;
						target[x2 + 2] = gx_b / weights;
						target[x2 + 3] = gx_a / weights_alpha;
					}
				}

				//return
				let objData = {
					core: core,
					target: target,
				};
				postMessage(objData, [target.buffer]);
			};
			//end worker
		}).toString(),
		')()'], {type: 'application/javascript'})),

    // Returns CPU cores count
    getCores: () => navigator.hardwareConcurrency || 4,

	/**
	 * Hermite resize. Resize actual image.
	 * 
	 * @param {string} image_id
	 * @param {int} width
	 * @param {int} height optional.
	 * @param {int} percentages optional.
	 * @param {string} multi_core optional.
	 */
    resize_image: (img, width, height, callback, percentages, multi_core) => {
		//create temp canvas
		let temp_canvas = document.createElement("canvas");
		temp_canvas.width = img.width;
		temp_canvas.height = img.height;
		let temp_ctx = temp_canvas.getContext("2d");

		//draw image
		temp_ctx.drawImage(img, 0, 0);

		//prepare size
		if (width == undefined && height == undefined && percentages != undefined) {
			width = img.width / 100 * percentages;
			height = img.height / 100 * percentages;
		}
		if (height == undefined) {
			let ratio = img.width / width;
			height = img.height / ratio;
		}
		width = Math.round(width);
		height = Math.round(height);

        let on_finish = () => hermite.toBlob(temp_canvas, callback);

		//resize
		if (multi_core == undefined || multi_core == true) {
			hermite.resample(temp_canvas, width, height, true, on_finish);
		}
		else {
			hermite.resample_single(temp_canvas, width, height, true);
			on_finish();
		}
	},

	/**
	 * Hermite resize, multicore version - fast image resize/resample using Hermite filter.
	 * 
	 * @param {HtmlElement} canvas
	 * @param {int} width
	 * @param {int} height
	 * @param {boolean} resize_canvas if true, canvas will be resized. Optional.
	 * @param {boolean} on_finish finish handler. Optional.
	 */
    resample: (canvas, width, height, resize_canvas, on_finish) => {
		let cores = hermite.getCores();
		let width_source = canvas.width;
		let height_source = canvas.height;
		width = Math.round(width);
		height = Math.round(height);
		let ratio_h = height_source / height;

		//stop old workers
		if (hermite.workers_archive.length > 0) {
			for (let c = 0; c < cores; c++) {
				if (hermite.workers_archive[c] != undefined) {
					hermite.workers_archive[c].terminate();
					delete hermite.workers_archive[c];
				}
			}
		}
		hermite.workers_archive = new Array(cores);
		let ctx = canvas.getContext("2d");

		//prepare source and target data for workers
		let data_part = [];
		let block_height = Math.ceil(height_source / cores / 2) * 2;
		let end_y = -1;
		for (let c = 0; c < cores; c++) {
			//source
			let offset_y = end_y + 1;
			if (offset_y >= height_source) {
				//size too small, nothing left for this core
				continue;
			}

			end_y = offset_y + block_height - 1;
			end_y = Math.min(end_y, height_source - 1);

			let current_block_height = block_height;
			current_block_height = Math.min(block_height, height_source - offset_y);

			data_part[c] = {};
			data_part[c].source = ctx.getImageData(0, offset_y, width_source, block_height);
			data_part[c].target = true;
			data_part[c].start_y = Math.ceil(offset_y / ratio_h);
			data_part[c].height = current_block_height;
		}

		//clear and resize canvas
		if (resize_canvas === true) {
			canvas.width = width;
			canvas.height = height;
		} else {
			ctx.clearRect(0, 0, width_source, height_source);
		}

		//start
		let workers_in_use = 0;
		for (let c = 0; c < cores; c++) {
			if (data_part[c] == undefined) {
				//no job for this worker
				continue;
			}

			workers_in_use++;
			let my_worker = new Worker(hermite.workerBlobURL);
			hermite.workers_archive[c] = my_worker;

			my_worker.onmessage = function (event) {
				workers_in_use--;
				let core = event.data.core;
				hermite.workers_archive[core].terminate();
				delete hermite.workers_archive[core];

				//draw
				let height_part = Math.ceil(data_part[core].height / ratio_h);
				data_part[core].target = ctx.createImageData(width, height_part);
				data_part[core].target.data.set(event.data.target);
				ctx.putImageData(data_part[core].target, 0, data_part[core].start_y);

				if (workers_in_use <= 0) {
					//finish
					if (on_finish != undefined) {
						on_finish();
					}
				}
			};
			let objData = {
				width_source: width_source,
				height_source: data_part[c].height,
				width: width,
				height: Math.ceil(data_part[c].height / ratio_h),
				core: c,
				source: data_part[c].source.data.buffer,
			};
			my_worker.postMessage(objData, [objData.source]);
		}
	},

	/**
	 * Hermite resize - fast image resize/resample using Hermite filter. 1 cpu version!
	 * 
	 * @param {HtmlElement} canvas
	 * @param {int} width
	 * @param {int} height
	 * @param {boolean} resize_canvas if true, canvas will be resized. Optional.
	 */
    resample_single: (canvas, width, height, resize_canvas) => {
		let width_source = canvas.width;
		let height_source = canvas.height;
		width = Math.round(width);
		height = Math.round(height);

		let ratio_w = width_source / width;
		let ratio_h = height_source / height;
		let ratio_w_half = Math.ceil(ratio_w / 2);
		let ratio_h_half = Math.ceil(ratio_h / 2);

		let ctx = canvas.getContext("2d");
		let img = ctx.getImageData(0, 0, width_source, height_source);
		let img2 = ctx.createImageData(width, height);
		let data = img.data;
		let data2 = img2.data;

		for (let j = 0; j < height; j++) {
			for (let i = 0; i < width; i++) {
				let x2 = (i + j * width) * 4;
				let weight = 0;
				let weights = 0;
				let weights_alpha = 0;
				let gx_r = 0;
				let gx_g = 0;
				let gx_b = 0;
				let gx_a = 0;
				let center_y = j * ratio_h;

				let xx_start = Math.floor(i * ratio_w);
				let xx_stop = Math.ceil((i + 1) * ratio_w);
				let yy_start = Math.floor(j * ratio_h);
				let yy_stop = Math.ceil((j + 1) * ratio_h);
				xx_stop = Math.min(xx_stop, width_source);
				yy_stop = Math.min(yy_stop, height_source);

				for (let yy = yy_start; yy < yy_stop; yy++) {
					let dy = Math.abs(center_y - yy) / ratio_h_half;
					let center_x = i * ratio_w;
					let w0 = dy * dy; //pre-calc part of w
					for (let xx = xx_start; xx < xx_stop; xx++) {
						let dx = Math.abs(center_x - xx) / ratio_w_half;
						let w = Math.sqrt(w0 + dx * dx);
						if (w >= 1) {
							//pixel too far
							continue;
						}
						//hermite filter
						weight = 2 * w * w * w - 3 * w * w + 1;
						let pos_x = 4 * (xx + yy * width_source);
						//alpha
						gx_a += weight * data[pos_x + 3];
						weights_alpha += weight;
						//colors
						if (data[pos_x + 3] < 255)
							weight = weight * data[pos_x + 3] / 250;
						gx_r += weight * data[pos_x];
						gx_g += weight * data[pos_x + 1];
						gx_b += weight * data[pos_x + 2];
						weights += weight;
					}
				}
				data2[x2] = gx_r / weights;
				data2[x2 + 1] = gx_g / weights;
				data2[x2 + 2] = gx_b / weights;
				data2[x2 + 3] = gx_a / weights_alpha;
			}
		}
		//clear and resize canvas
		if (resize_canvas === true) {
			canvas.width = width;
			canvas.height = height;
		} else {
			ctx.clearRect(0, 0, width_source, height_source);
		}

		//draw
		ctx.putImageData(img2, 0, 0);
	},
}
export default hermite;
