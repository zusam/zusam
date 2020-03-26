import exif from "./exif.js";
const pica = require("pica")();
const imageService = {
  resize: (img, width, height, callback) => {
    let canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    pica
      .resize(img, canvas)
      .then(res => pica.toBlob(res, "image/jpeg", 0.9))
      .then(blob => callback(blob));
  },
  handleImage: (source, callback) => {
    let fileSize = source.size;
    try {
      // don't use image reduction for iOS as it's problematic.
      // TODO: Find a fix and test those platforms.
      let iOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (iOS) {
        console.warn("Do not use image reduction on iOS !");
        callback(source);
        return;
      }
      if (!source.type || !source.type.match(/image/)) {
        console.warn("Do not use image reduction on invalid file !");
        callback(source);
        return;
      }
      if (source.type == "image/gif") {
        console.warn("Do not use image reduction on a gif !");
        callback(source);
        return;
      }
      if (fileSize < 1024 * 1024) {
        console.warn("Do not use image reduction on small file !");
        callback(source);
        return;
      }
      exif.getOrientation(source, orientation => {
        if (orientation != 1 && orientation != 2) {
          console.warn("Incorrect orientation !");
          callback(source);
          return;
        }
        let img = new Image();
        img.onload = () => {
          let w = Math.min(img.naturalWidth, 2048);
          // height is not limited to accomodate with long format images
          // example: https://imgs.xkcd.com/comics/earth_temperature_timeline.png
          let h = img.naturalHeight; //Math.min(img.naturalHeight, 2048);
          let g = Math.min(w / img.naturalWidth, h / img.naturalHeight);
          let nw = Math.floor(img.naturalWidth * g);
          let nh = Math.floor(img.naturalHeight * g);
          imageService.resize(img, nw, nh, blob => {
            callback(blob);
          });
        };
        img.src = URL.createObjectURL(source);
      });
    } catch (error) {
      console.warn(error); // error logging
      // If something goes wrong in image reduction, fall back to normal upload
      callback(source);
    }
  }
};
export default imageService;
