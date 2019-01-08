import lang from "./lang.js";

const util = {
    standardDate: timestamp => (new Date(timestamp*1000)).toISOString().replace("T", " ").replace(/\..*$/, ""),
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
}
export default util;
