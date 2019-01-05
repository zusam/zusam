import { h, render, Component } from "preact";
import bee from "./bee.js";
import YoutubeEmbed from "./youtube-embed.component.js";
import SoundcloudEmbed from "./soundcloud-embed.component.js";
import TwitchEmbed from "./twitch-embed.component.js";
import BandCampEmbed from "./bandcamp-embed.component.js";

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
        switch (data["providerUrl"].toLowerCase().replace(/\/$/, '').replace(/^https?:\/\/(www\.)?/, '')) {
            case "youtube.com":
                return <YoutubeEmbed preview={this.props.preview} url={data["url"]}/>;
            case "soundcloud.com":
                return <SoundcloudEmbed preview={this.props.preview} url={data["code"].match(/https:\/\/[^\"\s]+/)[0] + "&auto_play=true"}/>;
            case "twitch.tv":
                return <TwitchEmbed preview={this.props.preview} url={data["url"]}/>;
            case "bandcamp.com":
                return <BandCampEmbed url={data["code"].match(/https:\/\/.*album=\d+/)[0]}/>
            case "facebook.com":
            case "instagram.com":
            case "vimeo.com":
            case "dailymotion.com":
            case "imgur.com":
                // default embed code
                if (data["code"]) {
                    return <div class="embed-container" ref={e => this.embedContainer = e} dangerouslySetInnerHTML={{__html: data["code"]}}></div>;
                }
            default:
        }
        if (data["type"] == "photo" && /image/.test(data["content-type"])) {
            return (
                <div class="container d-flex justify-content-center flex-wrap align-items-center">
                    <img class="img-fluid" src={ this.props.url } />
                </div>
            );
        }
        if (data["type"] == "video" && /video/.test(data["content-type"])) {
            return (
                <div class="container d-flex justify-content-center flex-wrap align-items-center">
                    <video class="img-fluid" controls src={ this.props.url } />
                </div>
            );
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
