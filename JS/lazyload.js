function lazyload(e) {
	$(e).find('img.lazyload:not([src])').each(function() {
		var y = e.scrollTop + window.screen.height;
		var node = this;
		var yy = node.offsetTop - 10;
		while(!node.parentNode.className.match(/\.nano-content/) && node.parentNode != document.body) {
			node = node.parentNode;
			yy += node.offsetTop; 
		}
		if(yy < y) {
			unveil(this);
		}
	});
}

function unveil(e) {
	if(e.src === "") {
		console.log("load :"+e.dataset.src);
		e.src = e.dataset.src;	
		e.onload = function() {
			e.style.opacity = 1;
			e.removeAttribute('width');
			e.removeAttribute('height');
		};
	}
}

