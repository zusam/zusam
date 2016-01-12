function moveButterflies(speed) {
	var butterflies = document.getElementsByClassName('butterfly');
	console.log(butterflies);
	for(var i = 0; i < butterflies.length; i++) {
		var t = parseInt(butterflies[i].style.top);
		var l = parseInt(butterflies[i].style.left);
		var rot = document.getElementsByClassName('butterfly')[0].style.transform.match(/\d+/);
		if(rot != null) {
			var d = parseFloat(document.getElementsByClassName('butterfly')[0].style.transform.match(/\d+/)[0]);
		} else {
			var d = 0;
		}

		console.log(d,t,l);

		var nd = d + Math.random()*Math.PI/4;
		var nt = t - speed*Math.sin(nd);
		var nl = l + speed*Math.cos(nd);

		//console.log(t,l);

		//var nt = t + getRandomInt(-1*speed,speed);
		//var nl = l + getRandomInt(-1*speed,speed);

		console.log(nd, nt, nl);

		//var headingRad = Math.atan2( nt - t, nl - l);

		//console.log(headingRad);

		//var headingDeg = Math.floor(headingRad*180/Math.PI);

		//console.log(headingDeg);

		butterflies[i].style.top = nt;
		butterflies[i].style.left = nl;
		butterflies[i].style.transform = "rotate("+nd+"rad)";
	}
}
