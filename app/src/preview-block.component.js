import { h, render, Component } from "preact";
import http from "./http.js";

export default class PreviewBlock extends Component {

	execute(e) {
		if (e.innerHTML) {
			eval(e.innerHTML);
		} else {
			const url = e.getAttribute("src");
			if (url && !document.head.querySelector("[src='"+url+"']")) {
				const script = document.createElement("script");
				script.async = true;
				script.src = url;
				document.head.appendChild(script);
			}
		}
	}

	componentDidUpdate() {
		if (this.embedContainer) {
			Array.from(this.embedContainer.getElementsByTagName("script")).forEach(e => this.execute(e));
		}
	}

    render() {
        if (typeof(this.props.data) == "undefined" || !this.props.data) {
            return null;
        }
        let data = JSON.parse(this.props.data);
        if (data["type"] == "photo") {
            return (
                <div class="container d-flex justify-content-center flex-wrap">
                    <img src={ this.props.url } />
                </div>
            );
        }
        if (data["code"]) {
            return <div class="embed-container" ref={e => this.embedContainer = e} dangerouslySetInnerHTML={{__html: data["code"]}}></div>;
        }
        if (data["title"] && (this.props.preview || data["description"])) {
            return (
                <a class="seamless-link d-inline-block" target="_blank" href={ this.props.url }>
                    <div class="card" style="max-width: 480px">
                        { this.props.preview && <img class="card-img-top" src={ http.crop(this.props.preview, 320, 180) } /> }
                        <div class="card-body">
                            <h5>{ data["title"] }</h5>
                            <p><small>{ data["description"] }</small></p>
                        </div>
                    </div>
                </a>
            );
        }
        return null;
    }
}
