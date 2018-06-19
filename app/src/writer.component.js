import { h, render, Component } from "preact";
import lang from "./lang.js";
import bee from "./bee.js";
import FaIcon from "./fa-icon.component.js";

export default class Writer extends Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <div class="writer">
                <input type="text" id="title" placeholder={lang.fr["title_placeholder"]}></input>
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
                    <button type="submit" class="submit">{lang.fr.submit}</button>
                </div>
            </div>
        );
    }
}
