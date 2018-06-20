import { h, render, Component } from "preact";
import lang from "./lang.js";
import bee from "./bee.js";
import FaIcon from "./fa-icon.component.js";
import router from "./router.js";

export default class Writer extends Component {

    constructor(props) {
        super(props);
        this.postMessage = this.postMessage.bind(this);
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

    render() {
        return (
            <div class="writer">
                { !this.props.parent && <input type="text" id="title" placeholder={lang.fr["title_placeholder"]}></input> }
                <textarea
                    id="text"
                    placeholder={lang.fr["text_placeholder"]}
                    rows="5"
                    autocomplete="off"
                    autofocus
                ></textarea>
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
