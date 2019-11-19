import lang from './lang.js';

const util = {
    urlRegExp: (new RegExp('(\\([^()]*)?https?:\\/\\/[-A-Za-z0-9+&@#/%?=~_()|!:,.;*]*[-A-Za-z0-9+&@#/%=~_()|]', 'i')),
    getUrl: txt => {
        let url = txt.match(util.urlRegExp);
        if (url && url[0].startsWith("(")) {
            let link = url[0].match(/https?:\/\//i);
            url["index"] += link["index"];
            url[0] = url[0].slice(link["index"]);
            if (url[0].endsWith(")")) {
                url[0] = url[0].slice(0, -1);
            }
        }
        return url;
    },
    // full datetime as a string adapted to the users timezone
    humanFullDate: timestamp => {
        let d = new Date(timestamp*1000);
        d = new Date(d.getTime() + (d.getTimezoneOffset()*60000*-1));
        return d.toISOString().replace("T", " ").replace(/\..*$/, "");
    },
    // duration relative to event
    humanTime: timestamp => {
        if (!timestamp) {
            return null;
        }
        const duration = Math.abs(Math.round((Date.now()/1000 - timestamp)/60));
        if (duration < 1) {
            return lang.t("just_now");
        }
        if (duration < 60) {
            return lang.t("ago", {duration:duration + "mn"});
        }
        if (duration < 60 * 24) {
            return lang.t("ago", {duration:Math.floor(duration/60) + "h"});
        }
        let date = new Date(timestamp*1000);
        return util.humanFullDate(timestamp).split(" ")[0];
    },
    // get the id of an object from an url
    getId: e => {
        switch (typeof(e)) {
            case "object":
                return e ? e.id : null;
            case "string":
                return e.split("/").pop().replace(/\?.*$/, "").replace(/\.\w+$/, "");
        }
        console.warn(e);
        throw "Could not extract id !";
    },
    // get the url to a thubmnail
    thumbnail: (id, width, height) => id ? "/api/images/thumbnail/" + width + "/" + height + "/" + id : null,
    // same as http.thumbnail but for a crop
    crop: (id, width, height) => id ? "/api/images/crop/" + width + "/" + height + "/" + id : null,
    // default avatar in base64
    defaultAvatar: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAI4AAACOCAYAAADn/TAIAAAFIklEQVR4nO2dQW4UVxCGuQcnyA04QS6QnIBcILlAOEFOkOwRSNmwgQ0bIgErb0IkViwwG28SJUIKnrE9zN922208tqd/7K6qfl9J39rdrm9e1Xv9+vWd/x/eXQGM5U70BUBNEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsEAcsSoiz//z71cHu09Xh3svV8u2vq0+/fxN+Ta2TXhxJ82Uc/v0GeYJJL87Rx/cXxFEcvHsUfm0tk1qcxR8/bJTmdORZly6NSNHX2SKpxVm+/e1KcfrQqKTeZ//5d+HX7KDrFosX91fLP3/pUE+ne9KPJ/r6yolzWZm6LvomevH6x+OkPPt2WhHWf2+jDOvyqmsTY+4tY1lOK46a39sIJaxPnlBS+sRexzDxQ472/72Vax1GtpEnrTibZlMth2aS0TlBnKLx6cm98LwgTsFYvP4pPC+IUzDUZ0XnJb04gjgfWp6IzkkJcY4W/0XnKlUc7r0Kz0kJcQ4+PIvOVapAnC257pFDa0GpGgHl6ixojkegfxZxHEzHR3L4z1/ROUsRUz9zKy+O/mGtlyzdf3QeyomDPHpC/jg8ByXFOZXn4250DkMi24a1UuIIbbfYdoPXXEI9XvT/vbw4pwI9udcN33MPledMTXF5cYYCLXcezHLmpXvKKM0sxDkn0bqMabVZpUzL85Wbad1D5leAZiXOZaixFFpAu2xbqEQ7R9AI1pWmZI1ws+KMFq2bvXkb5b8m9FA38yiDOFcQ8YhDo4z6tOh7RxwDjTLaED51ZG6AEecaljs/T/KKy5eRaZsE4oxAU3m9FzV1VGmAEWcDmrZHjDKVGmDEGaCk6Y3MqaNiA4w4J4Q1wHuvUr1MhzgjUAM8dcxtlGlKnK407T6dXJo5jjLNiKOZy9QN8JxHmSbE0fk4U0fVxTzEeRjXAGd6dQVxRhKxAtzSKDM7caIa4MqPDJoXJ2IFWA1wtqPVEGdLjjetxzTAc55mz1qcqI1WLZem8uJEbbTK9N52BsqIE7nRitJUVJywjVaNrc3MRpyoafYcNlo1K07Ec6ZOmnXTrWP0+yP1L6P18pVSnIqHKan/Gh7xL/nmLFcqcbo9wAEN8G2GRs3uSzDrPm1OIqURp1ubCShNU4d+GPqqTfV9xynE0T+xBWmGofutPGtLIU7FnuamQs14xafrKcRpbbTZFNVWpsPF4WMfZ1FJnnBxWi5Tm6LKwmO4OHobgDgL9TwVZlzh4kRsj8geFd6SCBeHuBj6MUXnBXGKRvZeB3GSRvbFQcRJGjoOJTo3iFMwMn0NL6U4czzY+qYiOjepxWnhWH03onOTWhwtsxMXg1K1BZmOzlfpzHCcP+Jswdd+7VffsOqP0lfpGx61rxGtP5K/4wa2MGgn36Zj/jUTuqlHKNk+bJZSnF6e4UfM9IvvZdAblF1ydh6cJiz7NkxdX/dBkpPvRIwdwbK/m55GnBbQaCeRtvnKX/YHnYgTxFWTguyLfwJxAtm0F0klLXsZFogTTFe6TvoflbAq+48RJwlVhOlBHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLBAHLD4DOVazhHAxfyaAAAAAElFTkSuQmCC",
}
export default util;
