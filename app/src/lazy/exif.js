// https://stackoverflow.com/questions/7584794/accessing-jpeg-exif-rotation-data-in-javascript-on-the-client-side
// https://stackoverflow.com/questions/17411991/html5-canvas-rotate-image
// VALUES :
// -2 : not jpeg
// -1 : not defined
//  1 : 0deg
//  2 : 0deg reversed
//  3 : 180deg
//  4 : 180deg reversed
//  5 : -90deg reversed
//  6 : -90deg
//  7 : 90deg reversed
//  8 : 90deg
const exif = {
    getOrientation: (file, callback) => {
        let reader = new FileReader();
        reader.onload = function(e) {
            let view = new DataView(e.target.result);
            // if it doesn't start with the jpeg marker
            if (view.getUint16(0, false) != 0xFFD8) {
                return callback(-2);
            }
            let length = view.byteLength, offset = 2;
            // loop over all segments of data
            while (offset < length) {
                // if offset+2 is less than 8, it's undefined
                if (view.getUint16(offset+2, false) <= 8) return callback(-1);
                let marker = view.getUint16(offset, false);
                offset += 2;
                // if we have this marker, we should be able to read orientation
                if (marker == 0xFFE1) {
                    if (view.getUint32(offset += 2, false) != 0x45786966) {
                        return callback(-1);
                    }
                    let little = view.getUint16(offset += 6, false) == 0x4949;
                    offset += view.getUint32(offset + 4, little);
                    let tags = view.getUint16(offset, little);
                    offset += 2;
                    for (let i = 0; i < tags; i++) {
                        if (view.getUint16(offset + (i * 12), little) == 0x0112) {
                            return callback(view.getUint16(offset + (i * 12) + 8, little));
                        }
                    }
                } else if ((marker & 0xFF00) != 0xFF00) {
                    // it's undefined if marker is not 0xFF??
                    break;
                } else { 
                    offset += view.getUint16(offset, false);
                }
            }
            return callback(-1);
        };
        reader.readAsArrayBuffer(file);
    }
};
export default exif;
