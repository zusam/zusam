function sendIt() {
	title = $('#title').val();
	msg = "";
	prev = "";
	t = $('#typeBox');
	for(i=0;i<t.children().length;i++) {
		c = $(t.children()[i]);
		if(c.hasClass("deletable")) {
			msg += " "+c.attr('data-src');
			if(prev == "") {
				prev = c.attr('data-src');
			}
		} else {
			msg += " "+decode(c.html());
		}
	}
	console.log(title);
	console.log(msg);
	console.log(prev);

	xhr = new XMLHttpRequest();
	xhr.open("POST", window.dir+"save_msg.php");
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.onreadystatechange = function() { 	
		if (this.readyState == 4 && this.status == 200) { 
			console.log("xhr response:"+this.responseText);
		}
	};
	xhr.send("text="+msg+"&prev="+prev+"&title="+title+"&forum=test&name=niels");
}
