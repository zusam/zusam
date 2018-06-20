import { h, render, Component } from "preact";
import lang from "./lang.js";
import bee from "./bee.js";
import FaIcon from "./fa-icon.component.js";
import router from "./router.js";
import PreviewBlock from "./preview-block.component.js";

export default class Writer extends Component {

    constructor(props) {
        super(props);
        this.postMessage = this.postMessage.bind(this);
        this.getPreview = this.getPreview.bind(this);
    }

    postMessage() {
        let msg = {
            createdAt: Math.floor(Date.now()/1000),
            author: this.props.currentUser["@id"],
            group: this.props.group,
            children: [],
            files: [],
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
                }));
            }
        }, 0);
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
                <div class="options">
                    <button class="option"><FaIcon family={"regular"} icon={"images"}/></button>
                    <button class="option"><FaIcon family={"solid"} icon={"film"}/></button>
                    <button class="option"><FaIcon family={"regular"} icon={"calendar-alt"}/></button>
                    <button type="submit" class="submit" onClick={this.postMessage}>{lang.fr.submit}</button>
                </div>
            </div>
        );
    }
}
