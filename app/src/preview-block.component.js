import { h, render, Component } from "preact";
import bee from "./bee.js";
import YoutubeEmbed from "./youtube-embed.component.js";
import SoundcloudEmbed from "./soundcloud-embed.component.js";
import TwitchEmbed from "./twitch-embed.component.js";

export default class PreviewBlock extends Component {

	execute(e) {
		if (e.innerHTML) {
			eval(e.innerHTML);
		} else {
			const url = e.getAttribute("src");
			if (url) {
				const script = document.createElement("script");
				script.async = true;
				script.src = url;
				document.head.appendChild(script);
			}
		}
	}

    componentDidMount() {
		if (this.embedContainer) {
			Array.from(this.embedContainer.getElementsByTagName("script")).forEach(e => this.execute(e));
		}
    }

	componentDidUpdate() {
		if (this.embedContainer) {
			Array.from(this.embedContainer.getElementsByTagName("script")).forEach(e => this.execute(e));
		}
	}

    render() {
        if (!this.props.url || !this.props.data) {
            return null;
        }
        let data = JSON.parse(this.props.data);
        if (data["type"] == "photo") {
            return (
                <div class="container d-flex justify-content-center flex-wrap align-items-center">
                    <img class="img-fluid" src={ this.props.url } />
                </div>
            );
        }
        if (data["type"] == "video" && !data["code"]) {
            return (
                <div class="container d-flex justify-content-center flex-wrap align-items-center">
                    <video class="img-fluid" controls src={ this.props.url } />
                </div>
            );
        }
        switch (data["providerName"]) {
            case "YouTube":
                return <YoutubeEmbed preview={this.props.preview} url={data["url"]}/>;
            case "SoundCloud":
                return <SoundcloudEmbed preview={this.props.preview} url={data["code"].match(/https:\/\/[^\"\s]+/)[0] + "&auto_play=true"}/>;
            case "Twitch":
                return <TwitchEmbed preview={this.props.preview} url={data["url"]}/>;
            default:
                if (data["code"]) {
                    return <div class="embed-container" ref={e => this.embedContainer = e} dangerouslySetInnerHTML={{__html: data["code"]}}></div>;
                }
        }
        if (data["title"] && (this.props.preview || data["description"])) {
            return (
                <a class="seamless-link d-inline-block" target="_blank" href={ this.props.url }>
                    <div class="card" style="max-width: 480px">
                        { this.props.preview && <img class="card-img-top" src={ bee.crop(this.props.preview, 320, 180) } /> }
                        <div class="card-body p-1">
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
