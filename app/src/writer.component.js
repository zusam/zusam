import { h, render, Component } from "preact";
import lang from "./lang.js";
import bee from "./bee.js";
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
        this.state = {files: []};
    }

    componentWillMount() {
        this.setState({files: []});
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
            msg.parent = bee.getId(this.props.parent);
            msg.data.title = document.getElementById("title").value;
        }
        msg.data = JSON.stringify(msg.data);
        bee.http.post("/api/messages", msg).then(res => {
            router.navigate(this.props.backUrl);
        });
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
                    preview: r,
                    id: f.name,
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
            Array.from(event.target.files).forEach(f => {
				const formData = new FormData();
                formData.append("file", f);
                bee.http.post("/api/files/upload", formData, false).then(file => {
                    this.setState({files: [...this.state.files, file]});
                });
            })
        });
        input.click();
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
                { !!this.state.files.length && <FileGrid key={this.state.files.reduce((a,c) => a + c.id)} files={this.state.files}/> }
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
                    <button type="submit" class="submit" onClick={this.postMessage}>{lang.fr.submit}</button>
                </div>
            </div>
        );
    }
}
