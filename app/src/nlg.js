// nano lightbox gallery
let nlg = {
    list: [],
    bodyStyle: "",
    nlgStyles: `
        .nlg-left {
            left: -${document.body.clientWidth}px !important;
        }
        .nlg-right {
            left: ${document.body.clientWidth}px !important;
        }
    `,
    clickFn: e => {
        e.preventDefault();
        if (e.ctrlKey) {
            window.open(e.currentTarget.href, "_blank");
        } else {
            nlg.show(e.currentTarget);
        }
    },
    stop: () => {
        document.querySelectorAll("[data-nlg]").forEach(
            elm => elm.removeEventListener("click", nlg.clickFn)
        );
    },
    start: () => {
        nlg.stop();
		nlg.list = [];
        if (!document.getElementById("nlg-styles")) {
            let nlgStyles = document.createElement("style");
            nlgStyles.id = "nlg-styles";
            nlgStyles.innerHTML = nlg.nlgStyles;
            document.body.append(nlgStyles);
        }
        document.querySelectorAll("[data-nlg]").forEach(
            elm => {
                nlg.list.push(elm);
                elm.addEventListener("click", nlg.clickFn);
            }
        );
    },
    show: (e, keepBackground = false, side = null) => {
        let url = e.dataset.src || e.src || e.href;
		let media;
		switch (true) {
			case /\.(webm|mp4)$/.test(url):
				media = document.createElement("video");
				media.setAttribute("controls", true);
				break;
			case /\.(jpg|jpeg|png|bmp|webp|gif)$/.test(url):
			default:
				media = document.createElement("img");
		}
		media.classList.add("nlg-media");
        if (side) {
            media.classList.add("nlg-"+side);
        }
        nlg.bodyStyle = document.body.style.cssText;
        document.body.style.cssText = "overflow: hidden";
        if (!keepBackground) {
            let modalBackground = document.createElement("div");
            modalBackground.id = "nlg-modal-bg";
            modalBackground.addEventListener("click", e => {
                if (e.currentTarget != e.target) { return; }
                nlg.hide();
            });
            let close = document.createElement("a");
            close.id = "nlg-close";
            close.innerHTML = "&times;";
            close.addEventListener("click", nlg.hide);
            nlg.keyPressClose = e => e.keyCode == 27 && nlg.hide();
            window.addEventListener("keypress", nlg.keyPressClose);
            document.body.appendChild(close);
            document.body.appendChild(modalBackground);
        }
        let spinner = document.createElement("div");
        spinner.classList.add("spinner");
        for(let i = 0; i < 5; i++) {
            spinner.appendChild(document.createElement("div"));
        }
        setTimeout(() => {
            let spinner = document.querySelector("#nlg-modal-bg .spinner");
            if (spinner) {
                spinner.style.opacity = 1;
            }
        }, 500);
        document.getElementById("nlg-modal-bg").appendChild(spinner);
        let modal = document.createElement("div");
        modal.id = "nlg-modal";
        let mediaIsLoadedFn = () => {
            document.querySelector("#nlg-modal-bg .spinner").outerHTML = "";

            let ratio = media.width / media.height;
            media.width = Math.min(document.body.clientWidth, media.width);
            media.height = Math.min(document.body.clientHeight, media.width / ratio);
            media.width = media.height * ratio;

            let currentIndex = nlg.list.findIndex(e => url === (e.dataset.src || e.src || e.href));
            let nextElmt = nlg.list[currentIndex + 1];
            let prevElmt = nlg.list[currentIndex - 1];
            if (nextElmt) {
                let next = document.createElement("a");
                next.classList.add("nlg-next");
                next.innerHTML = "&#10095;";
                let nextFn = e => {
                    nlg.moveLeft();
                    setTimeout(() => {
                        nlg.hide(true);
                        nlg.show(nextElmt, true, "right");
                    }, 300);
                };
                next.addEventListener("click", nextFn);
                nlg.keyPressRight = e => e.keyCode == 39 && nextFn(e);
                window.addEventListener("keypress", nlg.keyPressRight);
                modal.appendChild(next);
            }
            if (prevElmt) {
                let prev = document.createElement("a");
                prev.innerHTML = "&#10094;";
                prev.classList.add("nlg-prev");
                let prevFn = e => {
                    nlg.moveRight();
                    setTimeout(() => {
                        nlg.hide(true);
                        nlg.show(prevElmt, true, "left");
                    }, 300);
                };
                prev.addEventListener("click", prevFn);
                nlg.keyPressLeft = e => e.keyCode == 37 && prevFn(e);
                window.addEventListener("keypress", nlg.keyPressLeft);
                modal.appendChild(prev);
            }
            modal.style.cssText = `opacity: 1;`;
            setTimeout(nlg.center, 1);
        };
		media.addEventListener("load", mediaIsLoadedFn);
		media.addEventListener("canplay", mediaIsLoadedFn);
        modal.addEventListener("click", e => {
            if (e.currentTarget != e.target) { return; }
            nlg.hide();
        });
        modal.appendChild(media);
        document.body.appendChild(modal);
        media.src = url;
    },
    hide: (keepBackground = false) => {
        if (document.getElementById("nlg-modal")) {
            window.removeEventListener("keypress", nlg.keyPressRight);
            window.removeEventListener("keypress", nlg.keyPressLeft);
            document.body.style.cssText = nlg.bodyStyle;
            document.getElementById("nlg-modal").outerHTML = "";
            if (keepBackground != true) {
                document.querySelector("#nlg-close").outerHTML = "";
                document.getElementById("nlg-modal-bg").outerHTML = "";
                window.removeEventListener("keypress", nlg.keyPressClose);
            }
        }
    },
    moveLeft: () => document.querySelector("#nlg-modal > .nlg-media").classList.add("nlg-left"),
    moveRight: () => document.querySelector("#nlg-modal > .nlg-media").classList.add("nlg-right"),
    center: () => {
        let media = document.querySelector("#nlg-modal > .nlg-media");
		media.classList.remove("nlg-right");
		media.classList.remove("nlg-left");
    },
};
export default nlg;
