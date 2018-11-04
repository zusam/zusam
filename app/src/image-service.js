import alert from "./alert.js";
const pica = require('pica')();
const imageService = {
    resize: (img, width, height, callback) => {
        let canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        try {
            pica.resize(img, canvas).then(res => pica.toBlob(res, "image/jpeg", 0.9)).then(blob => callback(blob));
        } catch (e) {
            alert.add(e.toString(), "alert-danger", 10000);
        }
    },
}
export default imageService;
