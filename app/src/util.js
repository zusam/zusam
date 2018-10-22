import lang from "./lang.js";

const util = {
    humanDate: timestamp => {
        if (!timestamp) {
            return null;
        }
        const duration = Math.round((Date.now()/1000 - timestamp)/60);
        if (duration < 60) {
            return lang.fr["there_is"] + " " + duration + "mn";
        }
        if (duration < 60 * 24) {
            return lang.fr["there_is"] + " " + Math.floor(duration/60) + "h";
        }
        let date = new Date(timestamp*1000);
        return ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
    },
    defaultAvatar: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAI4AAACOCAYAAADn/TAIAAAFIklEQVR4nO2dQW4UVxCGuQcnyA04QS6QnIBcILlAOEFOkOwRSNmwgQ0bIgErb0IkViwwG28SJUIKnrE9zN922208tqd/7K6qfl9J39rdrm9e1Xv9+vWd/x/eXQGM5U70BUBNEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsSoiz//z71cHu09Xh3svV8u2vq0+/fxN+Ta2TXhxJ82Uc/v0GeYJJL87Rx/cXxFEcvHsUfm0tk1qcxR8/bJTmdORZly6NSNHX2SKpxVm+/e1KcfrQqKTeZ//5d+HX7KDrFosX91fLP3/pUE+ne9KPJ/r6yolzWZm6LvomevH6x+OkPPt2WhHWf2+jDOvyqmsTY+4tY1lOK46a39sIJaxPnlBS+sRexzDxQ472/72Vax1GtpEnrTibZlMth2aS0TlBnKLx6cm98LwgTsFYvP4pPC+IUzDUZ0XnJb04gjgfWp6IzkkJcY4W/0XnKlUc7r0Kz0kJcQ4+PIvOVapAnC257pFDa0GpGgHl6ixojkegfxZxHEzHR3L4z1/ROUsRUz9zKy+O/mGtlyzdf3QeyomDPHpC/jg8ByXFOZXn4250DkMi24a1UuIIbbfYdoPXXEI9XvT/vbw4pwI9udcN33MPledMTXF5cYYCLXcezHLmpXvKKM0sxDkn0bqMabVZpUzL85Wbad1D5leAZiXOZaixFFpAu2xbqEQ7R9AI1pWmZI1ws+KMFq2bvXkb5b8m9FA38yiDOFcQ8YhDo4z6tOh7RxwDjTLaED51ZG6AEecaljs/T/KKy5eRaZsE4oxAU3m9FzV1VGmAEWcDmrZHjDKVGmDEGaCk6Y3MqaNiA4w4J4Q1wHuvUr1MhzgjUAM8dcxtlGlKnK407T6dXJo5jjLNiKOZy9QN8JxHmSbE0fk4U0fVxTzEeRjXAGd6dQVxRhKxAtzSKDM7caIa4MqPDJoXJ2IFWA1wtqPVEGdLjjetxzTAc55mz1qcqI1WLZem8uJEbbTK9N52BsqIE7nRitJUVJywjVaNrc3MRpyoafYcNlo1K07Ec6ZOmnXTrWP0+yP1L6P18pVSnIqHKan/Gh7xL/nmLFcqcbo9wAEN8G2GRs3uSzDrPm1OIqURp1ubCShNU4d+GPqqTfV9xynE0T+xBWmGofutPGtLIU7FnuamQs14xafrKcRpbbTZFNVWpsPF4WMfZ1FJnnBxWi5Tm6LKwmO4OHobgDgL9TwVZlzh4kRsj8geFd6SCBeHuBj6MUXnBXGKRvZeB3GSRvbFQcRJGjoOJTo3iFMwMn0NL6U4czzY+qYiOjepxWnhWH03onOTWhwtsxMXg1K1BZmOzlfpzHCcP+Jswdd+7VffsOqP0lfpGx61rxGtP5K/4wa2MGgn36Zj/jUTuqlHKNk+bJZSnF6e4UfM9IvvZdAblF1ydh6cJiz7NkxdX/dBkpPvRIwdwbK/m55GnBbQaCeRtvnKX/YHnYgTxFWTguyLfwJxAtm0F0klLXsZFogTTFe6TvoflbAq+48RJwlVhOlBHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLD4DOVazhHAxfyaAAAAAElFTkSuQmCC",
    downsizeImage: (src, NW, NH, callback) => {
        let cW, cH;
        let imgdata;
        /*
            why Math.floor ?
            https://29a.ch/2009/5/13/canvas-tag-drawimage-performance
            - Avoiding resampling from browser during drawImage
        */
        /* 
            Why divide by 2 ?
            http://stackoverflow.com/questions/18922880/html5-canvas-resize-downscale-image-high-quality#19144434
            For performances reasons Browsers do a very simple downsampling : 
            to build the smaller image, they will just pick ONE pixel in the source and use its value for the destination. 
            which 'forgots' some details and adds noise.
            Yet there's an exception to that : 
            since the 2X image downsampling is very simple to compute 
            (average 4 pixels to make one) and is used for retina/HiDPI pixels, this case is handled properly 
            -the Browser does make use of 4 pixels to make one-.
        */
        cW = Math.floor(src.naturalWidth / 2);
        cH = Math.floor(src.naturalHeight / 2);
        if(cW < NW) {
            cW = NW;
            cH = NH; 
        }
        if(cH < NH) {
            cH = NH;
            cW = NW;
        }

        let c = [];
        c.push(document.createElement("canvas"));
        c[0].width = cW;
        c[0].height = cH;

        let ctx;
        ctx = c[0].getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(src, 0, 0, cW, cH);

        if(cW <= NW || cH <= NH) {
            return c[0].toBlob(callback);
        }

        c.push(document.createElement("canvas"));
        let i = 0;
        while(i<10) { 
            i++;

            let nW = Math.floor(cW / 2);
            let nH = Math.floor(cH / 2);

            if(nW < NW) {
                nW = NW;
                nH = NH; 
            }
            if(nH < NH) {
                nH = NH;
                nW = NW;
            }

            c[i%2].width = nW;
            c[i%2].height = nH;
            ctx = c[i%2].getContext("2d");

            ctx.drawImage(c[(i-1)%2], 0, 0, cW, cH, 0, 0, nW, nH);
            if(nW <= NW || nH <= NH) {
                return c[i%2].toBlob(callback);
            }
            cW = nW;
            cH = nH;
        }
        throw "Something went wrong while downsizing the image.";
    }
}
export default util;
