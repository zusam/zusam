import { h, render, Component } from "preact";
import lang from "./lang.js";
import bee from "./bee.js";
import alert from "./alert.js";
import imageService from "./image-service.js";
import FaIcon from "./fa-icon.component.js";
import router from "./router.js";
import PreviewBlock from "./preview-block.component.js";
import FileGrid from "./file-grid.component.js";

export default class Writer extends Component {

    constructor(props) {
        super(props);
        this.postMessage = this.postMessage.bind(this);
        this.getPreview = this.getPreview.bind(this);
        this.inputImages = this.inputImages.bind(this);
        this.uploadNextFile = this.uploadNextFile.bind(this);
        this.state = {files: []};
    }

    componentWillMount() {
        this.setState({
            files: [],
            link: null,
            preview: null
        });
    }

    componentDidMount() {
        document.getElementById("text").value = "";
    }

    postMessage() {
        let msg = {
            createdAt: Math.floor(Date.now()/1000),
            author: this.props.currentUser["@id"],
            group: this.props.group,
            children: [],
            files: this.state.files.map(e => e["@id"]),
            data: {
                text: document.getElementById("text").value
            },
            lastActivityDate: Math.floor(Date.now()/1000)
        };
        if (!this.props.parent) {
            msg.data.title = document.getElementById("title").value;
        } else {
            msg.parent = "/api/messages/" + bee.getId(this.props.parent);
        }
        msg.data = JSON.stringify(msg.data);
        bee.http.post("/api/messages", msg).then(res => {
            if (res && this.props.parent) {
                window.dispatchEvent(new CustomEvent("newChild", {detail : res}));
            }
            if (this.props.backUrl) {
                router.navigate(this.props.backUrl);
            }
        });
        this.setState({
            files: [],
            link: null,
            preview: null
        });
        document.getElementById("text").value = "";
    }

    getPreview(event) {
        if (![" ", "Enter", "v"].includes(event.key)) {
            return;
        }
        // waiting for the dom to be updated
        setTimeout(() => {
            const text = document.getElementById("text").value;
            let links = text.match(/(https?:\/\/[^\s]+)/gi);
            if (links && links[0] != this.state.link) {
                bee.get("/api/links/by_url?url=" + encodeURIComponent(links[0])).then(r => r && this.setState({
                    link: links[0],
                    preview: r
                }));
            }
        }, 0);
    }

    inputImages(event) {
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = "multiple";
        input.accept = "image/*";
        input.addEventListener("change", event => {
            let list = Array.from(event.target.files);
            let files = this.state.files || [];
            try {
                if (list.length) {
                    try {
                        let plop = list[Symbol.iterator]();
                        this.uploadNextFile(list, plop, files.length);
                    } catch (e) {
                        alert.add(e.toString() + ", " + list.toString() + ", " + plop.toString(), "alert-danger", 10000);
                    }
                    this.setState({files: [...files, ...Array.apply(null, Array(list.length)).map(_ => new Object({fileIndex: 1000}))]})
                }
            } catch (e) {
                alert.add(e.toString(), "alert-danger", 10000);
            }
        });
        input.click();
    }

    uploadNextFile(list, it, n) {
        try {
            let e = it.next();
        } catch (e) {
            alert.add("it.next()", "alert-danger", 10000);
        }
        if (!e.value) {
            return;
        }
        if (e.value.type.match(/image/) && e.value.size > 1024*1024) {
            let img = new Image();
            img.onload = () => {
                try {
                    let w = Math.min(img.naturalWidth, 2048);
                    let h = Math.min(img.naturalHeight, 2048);
                    let g = Math.min(w/img.naturalWidth, h/img.naturalHeight);
                    let nw = Math.floor(img.naturalWidth*g);
                    let nh = Math.floor(img.naturalHeight*g);
                } catch (e) {
                    alert.add("img.natural", "alert-danger", 10000);
                }
                imageService.resize(img, nw, nh, blob => {
                    const index = list.indexOf(e.value);
                    const formData = new FormData();
                    formData.append("file", blob);
                    formData.append("fileIndex", index + n);
                    bee.http.post("/api/files/upload", formData, false).then(file => {
                        let a = this.state.files;
                        a.splice(index + n, 1, file);
                        this.setState({files: a})
                        this.uploadNextFile(list, it, n);
                    });
                });
            }
            try {
                img.src = URL.createObjectURL(e.value);
            } catch (e) {
                alert.add("createObjectUrl", "alert-danger", 10000);
            }
        } else {
            const index = list.indexOf(e.value);
            const formData = new FormData();
            formData.append("file", e.value);
            formData.append("fileIndex", index);
            bee.http.post("/api/files/upload", formData, false).then(file => {
                let a = this.state.files;
                a.splice(index + n, 1, file);
                this.setState({files: a})
                this.uploadNextFile(list, it, n);
            });
        }
    }

    render() {
        return (
            <div class="writer">
                { !this.props.parent && <input type="text" id="title" placeholder={lang.fr["title_placeholder"]}></input> }
                <textarea
                    onKeyPress={this.getPreview}
                    id="text"
                    placeholder={lang.fr["text_placeholder"]}
                    rows="5"
                    autocomplete="off"
                    autofocus
                ></textarea>
                { this.state.preview && <p class="card-text"><PreviewBlock {...this.state.preview} /></p> }
                { !!this.state.files.length && <FileGrid key={this.state.files.reduce((a,c) => a + c.id, "")} files={this.state.files}/> }
                <div class="options">
                    <button
                        class="option"
                        onClick={this.inputImages}
                        title={lang.fr["upload_image"]}
                    >
                        <FaIcon family={"regular"} icon={"images"}/>
                    </button>
                    {/*
                        <button
                            class="option"
                            title={lang.fr["upload_video"]}
                        >
                            <FaIcon family={"solid"} icon={"film"}/>
                        </button>
                        <button
                            class="option"
                            title={lang.fr["upload_music"]}
                        >
                            <FaIcon family={"solid"} icon={"music"}/>
                        </button>
                        <button
                            class="option"
                            title={lang.fr["add_date"]}
                        >
                            <FaIcon family={"regular"} icon={"calendar-alt"}/>
                        </button>
                    */}
                    <button type="submit" class="submit" onClick={this.postMessage}>{lang.fr.submit}</button>
                </div>
            </div>
        );
    }
}
