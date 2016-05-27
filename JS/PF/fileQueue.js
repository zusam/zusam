function handleFileSelect(evt) {
	var files = evt.target.files;
	var id = evt.target.dataset.id;
	console.log(id);
	console.log("change!");
	file = files[0];
	// Choose the right max number TODO
	if(files.length > 100) {
		alert('Le nombre maximum de fichier que vous pouvez envoyer en même temps est 100');
		return false;
	} else {
		for(var i=0;i<files.length;i++) {
			var fileId = createId();
			fileQueue.push({"file":files[i],"id":id,"fileId":fileId});
		}
		startProcessingFileFromQueue();
	}
	evt.target.value = null;
}

function startProcessingFileFromQueue() {
	if(typeof(fileQueue) == "undefined" || fileQueue.length === 0) {
		$('.send').removeAttr('disabled');
		// TODO select balise more carefully
		// TODO erase timeout
		// small timeout to prevail before showing functions
		setTimeout(function() {
			$('.loading-balise .info-title').html("Envoi terminé");
		}, 100);
		return;
	}
	console.log("queue length : "+fileQueue.length);
	$('.send').attr('disabled','true');
	setTimeout(function() {
		var processObject = fileQueue.shift();
		positionInQueue++;
		handleFile(processObject.file, processObject.id, processObject.fileId);
	}, 0);
}

function handleFile(file,id, fileId) {
	console.log(file);
	var fileTypeHandled = false;
	if(file.type.match(/image/)) {
		fileTypeHandled = true;
		if(file.size > 1024*1024*30) {
			alert("fichier image trop lourd (max 30Mo)");
		} else {
			if(file.type.match(/gif/)) {
				PF.loadGif(file,id, fileId);
			} else {
				// check if there is a lot of images following (img dump)
				var i = 0;
				var count = 0;
				while(i<fileQueue.length) {
					if(fileQueue[i].file.type.match(/image/) && !fileQueue[i].file.type.match(/gif/)) {
						count++;
					} else {
						break;
					}
					i++;
				}
				if(count > 10 || $(id).find('.loading-balise').length > 0) {
					if($(id).find('.loading-balise').length == 0) {
						$(id).append(genLoadingBalise());
					}
					PF.fastLoadImage(file, id, fileId);
				} else {
					PF.loadImage(file,id, fileId);
				}
			}
		}
	}
	if(file.type.match(/video/)) {
		fileTypeHandled = true;
		if(file.size > 1024*1024*300) {
			alert("fichier vidéo trop lourd (max 300Mo)");
		} else {
			PF.loadVideo(file,id, fileId);
		}
	}
	if(!fileTypeHandled) {
		alert("Le format du fichier n'est pas supporté");
	}
}

