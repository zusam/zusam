const reduceImport = require("image-blob-reduce");
const reduce = reduceImport.default();
const imageService = {
  handleImage: (source, callback) => {
    let fileSize = source.size;
    try {
      // don't use image reduction for iOS as it's problematic.
      // TODO: Find a fix and test those platforms.
      let iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
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
      if (fileSize < 1024 * 256) {
        console.warn("Do not use image reduction on small file !");
        callback(source);
        return;
      }
      reduce.toBlob(source, {max: 2048, unsharpAmount: 100, unsharpRadius: 1, quality: 2}).then(blob => callback(blob));
    } catch (error) {
      // TODO error logging
      console.warn(error);
      // If something goes wrong in image reduction, fall back to normal upload
      callback(source);
    }
  }
};
export default imageService;
