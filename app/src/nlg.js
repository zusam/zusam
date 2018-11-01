// nano lightbox gallery
let nlg = {
    list: [],
    bodyStyle: "",
    nlgStyles: `
        #nlg-modal-bg {
            position: fixed;
            width: 100%; height: 100%;
            top: 0; left: 0; right: 0; bottom: 0;
            z-index: 9997;
            background: rgba(0, 0, 0, 0.7);
            display: flex; justify-content: center; align-items: center;
        }
        #nlg-modal .nlg-next, #nlg-modal .nlg-prev, #nlg-close {
            cursor: pointer;
            position: absolute;
            top: 50%;
            padding: 19px 22px 22px 22px;
            margin-top: -3rem;
            color: white;
            font-size: 2rem;
            background: rgba(0, 0, 0, 0.2);
            transition: .5s;
        }
        .nlg-next:hover, .nlg-prev:hover, #nlg-close {
            background: rgba(0, 0, 0, 0.5);
        }
        #nlg-close {
            position: fixed;
            z-index: 9999;
            right: 0; top: 0;
            border-radius: 0 0 0 3px;
            transform: translateY(50%);
            font-weight: bold;
        }
        .nlg-next {
            right: 0;
            border-radius: 3px 0 0 3px;
        }
        .nlg-prev {
            left: 0;
            border-radius: 0 3px 3px 0;
        }
        #nlg-modal {
            left: 0;
            position: absolute;
            overflow: visible;
            z-index: 9998;
            width: 100%;
            box-sizing: border-box;
            opacity: 0;
            transition: 300ms;
        }
        #nlg-modal > .nlg-media {
            position: relative;
            left: 0;
            transition: 300ms;
        }
        .nlg-left {
            left: -${window.innerWidth}px !important;
        }
        .nlg-right {
            left: ${window.innerWidth}px !important;
        }
        .nlg-spinner {
            margin: 100px auto;
            width: 50px;
            height: 40px;
            display: flex;
            justify-content: space-between;
            opacity: 0;
            transition: 500ms;
        }
        .nlg-spinner > div {
            background-color: #fff;
            height: 100%;
            width: 6px;
            animation: nlg-stretchdelay 1.2s infinite ease-in-out;
        }
        .nlg-spinner :nth-child(2) {
            animation-delay: -1.1s;
        }
        .nlg-spinner :nth-child(3) {
            animation-delay: -1.0s;
        }
        .nlg-spinner :nth-child(4) {
            animation-delay: -0.9s;
        }
        .nlg-spinner :nth-child(5) {
            animation-delay: -0.8s;
        }
        @keyframes nlg-stretchdelay {
            0%, 40%, 100% {
                transform: scaleY(0.4);
            }  20% {
                transform: scaleY(1.0);
            }
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
        spinner.classList.add("nlg-spinner");
        for(let i = 0; i < 5; i++) {
            spinner.appendChild(document.createElement("div"));
        }
        setTimeout(() => {
            let spinner = document.querySelector(".nlg-spinner");
            if (spinner) {
                spinner.style.opacity = 1;
            }
        }, 500);
        document.getElementById("nlg-modal-bg").appendChild(spinner);
        let modal = document.createElement("div");
        modal.id = "nlg-modal";
        let mediaIsLoadedFn = () => {
            document.querySelector(".nlg-spinner").outerHTML = "";
            if (window.innerWidth/window.innerHeight > media.width/media.height) {
                media.height = window.innerHeight;
            } else {
                media.width = window.innerWidth;
            }
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
            modal.style.cssText = `
                top: ${window.scrollY + Math.floor(window.innerHeight/2 - media.scrollHeight/2)}px;
                padding: 0 ${window.scrollX + Math.floor(window.innerWidth/2 - media.scrollWidth/2)}px;
                opacity: 1;
            `;
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
