import { h, render, Component } from "preact";
import lang from "./lang.js";
import util from "./util.js";
import http from "./http.js";
import me from "./me.js";
import cache from "./cache.js";
import alert from "./alert.js";
import imageService from "./image-service.js";
import FaIcon from "./fa-icon.component.js";
import router from "./router.js";
import PreviewBlock from "./preview-block.component.js";
import FileGrid from "./file-grid.component.js";

export default class Writer extends Component {

    constructor(props) {
        super(props);
        this.sendMessage = this.sendMessage.bind(this);
        this.postMessage = this.postMessage.bind(this);
        this.putMessage = this.putMessage.bind(this);
        this.getPreview = this.getPreview.bind(this);
        this.toggleFile = this.toggleFile.bind(this);
        this.inputImages = this.inputImages.bind(this);
        this.inputVideo = this.inputVideo.bind(this);
        this.uploadFile = this.uploadFile.bind(this);
        this.uploadNextImage = this.uploadNextImage.bind(this);
        this.state = {files: []};
    }

    componentWillMount() {
        this.setState({
            files: this.props.files || [],
            link: null,
            preview: null
        });
    }

    componentDidMount() {
        (document.getElementById("title") || {}).value = this.props.title || "";
        (document.getElementById("text") || {}).value = this.props.text || "";
        if (this.props.focus) {
            setTimeout(() => {
                let t = document.getElementById("text");
                if (t) {
                    t.focus();
                    t.style.height = t.scrollHeight + "px";
                }
            }, 10);
        }
    }

    getPreview(event) {
        if (![" ", "Enter", "v"].includes(event.key)) {
            return;
        }
        let t = event.currentTarget;
        t.style.height = "1px";
        t.style.height = t.scrollHeight + "px";
        // waiting for the dom to be updated
        setTimeout(() => {
            const text = t.value;
            let links = text.match(/(https?:\/\/[^\s]+)/gi);
            if (links && links[0] != this.state.link) {
                cache.get("/api/links/by_url?url=" + encodeURIComponent(links[0])).then(r => {
                    if (r && t.value.indexOf(links[0]) >= 0) {
                        this.setState({link: links[0], preview: r});
                    }
                });
            }
        }, 0);
    }

    // toggle state (removed or not) of a file
    toggleFile(fileIndex) {
        let files = this.state.files;
        let f = files.find(f => f.fileIndex == fileIndex);
        f.removed = f.removed ? false : true;
        this.setState({files: files});
    }

    sendMessage() {
        if (this.props.messageId) {
            this.putMessage();
        } else {
            this.postMessage();
        }
    }

    putMessage() {
        let msg = {
            files: this.state.files.filter(e => !e.removed).map(e => e["@id"]).filter(e => !!e),
            data: {
                text: document.getElementById("text").value
            },
        };
        if (!this.props.parent) {
            msg.data.title = document.getElementById("title").value;
        }
        msg.data = JSON.stringify(msg.data);
        http.put("/api/messages/" + this.props.messageId, msg).then(res => {
            if (!res) {
                alert.add(lang.fr["error_new_message"], "alert-danger");
                return;
            }
            location.reload();
        });
    }

    postMessage() {
        let msg = {
            createdAt: Math.floor(Date.now()/1000),
            author: me.me["@id"],
            group: this.props.group,
            children: [],
            files: this.state.files.filter(e => !e.removed).map(e => e["@id"]).filter(e => !!e),
            data: {
                text: document.getElementById("text").value
            },
            lastActivityDate: Math.floor(Date.now()/1000)
        };
        if (!this.props.parent) {
            msg.data.title = document.getElementById("title").value;
        } else {
            msg.parent = "/api/messages/" + util.getId(this.props.parent);
        }
        // don't post if there is nothing to post
        if (!msg.files.length && !msg.data.text && !msg.data.title) {
            alert.add(lang.fr["empty_message"], "alert-danger");
            return;
        }
        http.post("/api/messages", msg).then(res => {
            if (!res) {
                alert.add(lang.fr["error_new_message"], "alert-danger");
                return;
            }
            cache.resetCache();
            if (this.props.parent) {
                window.dispatchEvent(new CustomEvent("newChild", {detail : res}));
            }
            if (router.action == "write" && router.backUrl) {
                router.navigate(router.backUrl);
            }
        });
        this.setState({
            files: [],
            link: null,
            preview: null
        });
        document.getElementById("text").value = "";
    }

    inputImages(event) {
        const input = document.createElement("input");
        document.body.appendChild(input);
        input.style.display = "none";
        input.type = "file";
        input.multiple = "multiple";
        input.accept = "image/*";
        input.addEventListener("change", event => {
            let list = Array.from(event.target.files);
            let files = this.state.files;
            this.setState({files: [...files, ...Array.apply(null, Array(list.length)).map(_ => new Object({
                fileIndex: 1000,
            }))]});
            this.uploadNextImage(list, list[Symbol.iterator](), files.length);
        });
        input.click();
    }

    inputVideo(event) {
        const input = document.createElement("input");
        document.body.appendChild(input);
        input.style.display = "none";
        input.type = "file";
        input.accept = "video/*";
        input.addEventListener("change", event => {
            let files = this.state.files;
            let placeholderIndex = Date.now();
            this.setState({files: [...files, {
                fileIndex: placeholderIndex,
                type: "video",
                progress: 0,
            }]});
            this.uploadFile(event.target.files[0], files.length, placeholderIndex);
        });
        input.click();
    }

    uploadNextImage(list, it, n) {
        let e = null;
        try {
            if (!it) {
                return;
            }
            e = it.next();
            if (!e || !e.value) {
                return;
            }
            let fileSize = e.value.size;
        } catch (evt) {
            // this is a fix for firefox mobile
            // firefox mobile only gets one file on "input multiple" and throws on getting the size
            // https://bugzilla.mozilla.org/show_bug.cgi?id=1456557
            alert.add(lang.fr["multiple_photos_upload"], "alert-danger");
            return;
        }
        imageService.handleImage(
            e.value,
            res => this.uploadFile(
                res,
                n + list.indexOf(e.value),
                null,
                () => this.uploadNextImage(list, it, n)
            )
        );
    }

    uploadFile(file, fileIndex, placeholderIndex, callback = null) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileIndex", fileIndex);
        let progressFn = placeholderIndex ? e => {
            if (Array.isArray(this.state.files)) {
                let a = this.state.files;
                file = a.find(f => f.fileIndex == placeholderIndex)
                if (file) {
                    file.progress = Math.floor(e.loaded/e.total*100);
                    a.splice(fileIndex, 1, file);
                    this.setState({files: a})
                }
            }
        } : null;
        http.sendFile(formData, file => {
            let a = this.state.files;
            if (file["@type"] == "hydra:Error") {
                a.splice(fileIndex, 1);
                console.warn(file);
                alert.add(lang.fr["error_upload"], "alert-danger");
            } else {
                a.splice(fileIndex, 1, file);
            }
            this.setState({files: a})
            if (callback) {
                callback();
            }
        }, progressFn);
    }

    render() {
        return (
            <div class="writer">
                { !this.props.parent && (
                    <input
                        type="text" id="title"
                        placeholder={lang.fr["title_placeholder"]}
                    ></input>
                )}
                <textarea
                    onKeyPress={this.getPreview}
                    id="text"
                    placeholder={lang.fr["text_placeholder"]}
                    rows="5"
                    autocomplete="off"
                    autofocus={this.props.focus}
                ></textarea>
                { this.state.preview && <p class="card-text"><PreviewBlock inWriter={true} {...this.state.preview} /></p> }
                { !!this.state.files.length && (
                    <FileGrid
                        key={this.state.files.reduce((a,c) => a + c.id, "")}
                        files={this.state.files}
                        toggleFile={this.toggleFile}
                        inWriter={true}
                    />
                )}
                <div class="options">
                    <button
                        class="option"
                        onClick={this.inputImages}
                        title={lang.fr["upload_image"]}
                    >
                        <FaIcon family={"regular"} icon={"images"}/>
                    </button>
                        <button
                            class="option"
                            onClick={this.inputVideo}
                            title={lang.fr["upload_video"]}
                        >
                            <FaIcon family={"solid"} icon={"film"}/>
                        </button>
                    <button type="submit" class="submit" onClick={this.sendMessage}>{lang.fr.submit}</button>
                </div>
            </div>
        );
    }
}
