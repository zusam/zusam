const alert = {
    remove: id => document.getElementById(id).outerHTML = "",
    add: (text, alertStyle = "alert-success", countdown = 5000) => {
        let alertNode = document.createElement("DIV");
        alertNode.id = alert.hash(text);
        alertNode.innerHTML = text;
        alertNode.classList.add("global-alert", "alert", alertStyle);
        document.body.appendChild(alertNode);
        setTimeout(() => alert.remove(alertNode.id), countdown);
    },
    hash: (str) => {
        let hash = 0;
        if (str.length == 0) {
            return hash;
        }
        for (let i = 0; i < str.length; i++) {
            let char = str.charCodeAt(i);
            hash = ((hash<<5)-hash)+char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }
};
export default alert;
