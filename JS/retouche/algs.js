// cf : http://stackoverflow.com/questions/18922880/html5-canvas-resize-downscale-image-high-quality
// scales the canvas by (float) scale < 1
// returns a new canvas containing the scaled image.
function downScaleCanvas(cv, scale) {
	if(scale == 1) { 
		return cv;
	}
	if(!(scale < 1) || !(scale > 0)) throw ('scale must be a positive number <1 ');
	var sqScale = scale * scale; // square scale = area of source pixel within target
	var sw = cv.width; // source image width
	var sh = cv.height; // source image height
	var tw = Math.floor(sw * scale); // target image width
	var th = Math.floor(sh * scale); // target image height
	var sx = 0, sy = 0, sIndex = 0; // source x,y, index within source array
	var tx = 0, ty = 0, yIndex = 0, tIndex = 0; // target x,y, x,y index within target array
	var tX = 0, tY = 0; // rounded tx, ty
	var w = 0, nw = 0, wx = 0, nwx = 0, wy = 0, nwy = 0; // weight / next weight x / y
	// weight is weight of current source point within target.
	// next weight is weight of current source point within next target's point.
	var crossX = false; // does scaled px cross its current px right border ?
	var crossY = false; // does scaled px cross its current px bottom border ?
	var sBuffer = cv.getContext('2d').
		getImageData(0, 0, sw, sh).data; // source buffer 8 bit rgba
	var tBuffer = new Float32Array(3 * tw * th); // target buffer Float32 rgb
	var sR = 0, sG = 0,  sB = 0; // source's current point r,g,b

	for (sy = 0; sy < sh; sy++) {
		ty = sy * scale; // y src position within target
		tY = 0 | ty;     // rounded : target pixel's y
		yIndex = 3 * tY * tw;  // line index within target array
		crossY = (tY != (0 | ty + scale)); 
		if (crossY) { // if pixel is crossing botton target pixel
			wy = (tY + 1 - ty); // weight of point within target pixel
			nwy = (ty + scale - tY - 1); // ... within y+1 target pixel
		}
		for (sx = 0; sx < sw; sx++, sIndex += 4) {
			tx = sx * scale; // x src position within target
			tX = 0 |  tx;    // rounded : target pixel's x
			tIndex = yIndex + tX * 3; // target pixel index within target array
			crossX = (tX != (0 | tx + scale));
			if (crossX) { // if pixel is crossing target pixel's right
				wx = (tX + 1 - tx); // weight of point within target pixel
				nwx = (tx + scale - tX - 1); // ... within x+1 target pixel
			}
			sR = sBuffer[sIndex    ];   // retrieving r,g,b for curr src px.
			sG = sBuffer[sIndex + 1];
			sB = sBuffer[sIndex + 2];

			if (!crossX && !crossY) { // pixel does not cross
				// just add components weighted by squared scale.
				tBuffer[tIndex    ] += sR * sqScale;
				tBuffer[tIndex + 1] += sG * sqScale;
				tBuffer[tIndex + 2] += sB * sqScale;
			} else if (crossX && !crossY) { // cross on X only
				w = wx * scale;
				// add weighted component for current px
				tBuffer[tIndex    ] += sR * w;
				tBuffer[tIndex + 1] += sG * w;
				tBuffer[tIndex + 2] += sB * w;
				// add weighted component for next (tX+1) px                
				nw = nwx * scale
					tBuffer[tIndex + 3] += sR * nw;
				tBuffer[tIndex + 4] += sG * nw;
				tBuffer[tIndex + 5] += sB * nw;
			} else if (crossY && !crossX) { // cross on Y only
				w = wy * scale;
				// add weighted component for current px
				tBuffer[tIndex    ] += sR * w;
				tBuffer[tIndex + 1] += sG * w;
				tBuffer[tIndex + 2] += sB * w;
				// add weighted component for next (tY+1) px                
				nw = nwy * scale
					tBuffer[tIndex + 3 * tw    ] += sR * nw;
				tBuffer[tIndex + 3 * tw + 1] += sG * nw;
				tBuffer[tIndex + 3 * tw + 2] += sB * nw;
			} else { // crosses both x and y : four target points involved
				// add weighted component for current px
				w = wx * wy;
				tBuffer[tIndex    ] += sR * w;
				tBuffer[tIndex + 1] += sG * w;
				tBuffer[tIndex + 2] += sB * w;
				// for tX + 1; tY px
				nw = nwx * wy;
				tBuffer[tIndex + 3] += sR * nw;
				tBuffer[tIndex + 4] += sG * nw;
				tBuffer[tIndex + 5] += sB * nw;
				// for tX ; tY + 1 px
				nw = wx * nwy;
				tBuffer[tIndex + 3 * tw    ] += sR * nw;
				tBuffer[tIndex + 3 * tw + 1] += sG * nw;
				tBuffer[tIndex + 3 * tw + 2] += sB * nw;
				// for tX + 1 ; tY +1 px
				nw = nwx * nwy;
				tBuffer[tIndex + 3 * tw + 3] += sR * nw;
				tBuffer[tIndex + 3 * tw + 4] += sG * nw;
				tBuffer[tIndex + 3 * tw + 5] += sB * nw;
			}
		} // end for sx 
	} // end for sy

	// create result canvas
	var resCV = document.createElement('canvas');
	resCV.width = tw;
	resCV.height = th;
	var resCtx = resCV.getContext('2d');
	var imgRes = resCtx.getImageData(0, 0, tw, th);
	var tByteBuffer = imgRes.data;
	// convert float32 array into a UInt8Clamped Array
	var pxIndex = 0; 
	for (sIndex = 0, tIndex = 0; pxIndex < tw * th; sIndex += 3, tIndex += 4, pxIndex++) {
		tByteBuffer[tIndex] = Math.ceil(tBuffer[sIndex]);
		tByteBuffer[tIndex + 1] = Math.ceil(tBuffer[sIndex + 1]);
		tByteBuffer[tIndex + 2] = Math.ceil(tBuffer[sIndex + 2]);
		tByteBuffer[tIndex + 3] = 255;
	}
	// writing result to canvas.
	resCtx.putImageData(imgRes, 0, 0);
	return resCV;
}

//name: Hermite resize
//about: Fast image resize/resample using Hermite filter with JavaScript.
//author: ViliusL
//demo: http://viliusle.github.io/miniPaint/
//function resample_hermite(canvas, W, H, W2, H2){
//	var time1 = Date.now();
//	W2 = Math.round(W2);
//	H2 = Math.round(H2);
//	var img = canvas.getContext("2d").getImageData(0, 0, W, H);
//	var img2 = canvas.getContext("2d").getImageData(0, 0, W2, H2);
//	var data = img.data;
//	var data2 = img2.data;
//	var ratio_w = W / W2;
//	var ratio_h = H / H2;
//	var ratio_w_half = Math.ceil(ratio_w/2);
//	var ratio_h_half = Math.ceil(ratio_h/2);
//
//	for(var j = 0; j < H2; j++){
//		for(var i = 0; i < W2; i++){
//			var x2 = (i + j*W2) * 4;
//			var weight = 0;
//			var weights = 0;
//			var weights_alpha = 0;
//			var gx_r = gx_g = gx_b = gx_a = 0;
//			var center_y = (j + 0.5) * ratio_h;
//			for(var yy = Math.floor(j * ratio_h); yy < (j + 1) * ratio_h; yy++){
//				var dy = Math.abs(center_y - (yy + 0.5)) / ratio_h_half;
//				var center_x = (i + 0.5) * ratio_w;
//				var w0 = dy*dy //pre-calc part of w
//					for(var xx = Math.floor(i * ratio_w); xx < (i + 1) * ratio_w; xx++){
//						var dx = Math.abs(center_x - (xx + 0.5)) / ratio_w_half;
//						var w = Math.sqrt(w0 + dx*dx);
//						if(w >= -1 && w <= 1){
//							//hermite filter
//							weight = 2 * w*w*w - 3*w*w + 1;
//							if(weight > 0){
//								dx = 4*(xx + yy*W);
//								//alpha
//								gx_a += weight * data[dx + 3];
//								weights_alpha += weight;
//								//colors
//								if(data[dx + 3] < 255)
//									weight = weight * data[dx + 3] / 250;
//								gx_r += weight * data[dx];
//								gx_g += weight * data[dx + 1];
//								gx_b += weight * data[dx + 2];
//								weights += weight;
//							}
//						}
//					}		
//			}
//			data2[x2]     = gx_r / weights;
//			data2[x2 + 1] = gx_g / weights;
//			data2[x2 + 2] = gx_b / weights;
//			data2[x2 + 3] = gx_a / weights_alpha;
//		}
//	}
//	console.log("hermite = "+(Math.round(Date.now() - time1)/1000)+" s");
//	canvas.getContext("2d").clearRect(0, 0, Math.max(W, W2), Math.max(H, H2));
//	canvas.width = W2;
//	canvas.height = H2;
//	canvas.getContext("2d").putImageData(img2, 0, 0);
//}
//

function turn(cv, rotation) {
	
	var ctx = cv.getContext('2d');
	//var img = ctx.getImageData(0, 0, cv.width, cv.height);
	var canvas = document.createElement('canvas');
	
	var sBuffer = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
	var tBuffer = new Float32Array(3 * cv.height * cv.width);
	var sIndex = 0;
	for(sy = 0; sy < cv.height; sy++) {
		for(sx = 0; sx < cv.width; sx++, sIndex += 4) {
			if(rotation == "cw") {
				tIndex = (cv.height-1-sy + cv.height*sx)*3;
			} else {
				tIndex = ((cv.width-1-sx)*cv.height + sy)*3;
			}
			tBuffer[tIndex] = sBuffer[sIndex];
			tBuffer[tIndex + 1] = sBuffer[sIndex + 1];
			tBuffer[tIndex + 2] = sBuffer[sIndex + 2];
		}
	}
	
	// create result canvas
	var resCV = document.createElement('canvas');
	resCV.width = cv.height;
	resCV.height = cv.width;
	var resCtx = resCV.getContext('2d');
	var imgRes = resCtx.getImageData(0, 0, cv.height, cv.width);
	var tByteBuffer = imgRes.data;
	// convert float32 array into a UInt8Clamped Array
	var pxIndex = 0;
	for (sIndex = 0, tIndex = 0; pxIndex < cv.height * cv.width; sIndex += 3, tIndex += 4, pxIndex++) {
		tByteBuffer[tIndex] = Math.ceil(tBuffer[sIndex]);
		tByteBuffer[tIndex + 1] = Math.ceil(tBuffer[sIndex + 1]);
		tByteBuffer[tIndex + 2] = Math.ceil(tBuffer[sIndex + 2]);
		tByteBuffer[tIndex + 3] = 255;
	}
	// writing result to canvas.
	resCtx.putImageData(imgRes, 0, 0);
	return resCV;
}
