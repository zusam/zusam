import { h, render, Component } from "preact";
import util from "./util.js";
import YoutubeEmbed from "./embeds/youtube-embed.component.js";
import SoundcloudEmbed from "./embeds/soundcloud-embed.component.js";
import TwitchEmbed from "./embeds/twitch-embed.component.js";
import BandCampEmbed from "./embeds/bandcamp-embed.component.js";

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
        let provider = "";
        if (this.props.data["providerUrl"]) {
            provider = this.props.data["providerUrl"].toLowerCase().replace(/\/$/, '').replace(/^https?:\/\/(www\.)?/, '')
        }
        switch (provider) {
            case "youtube.com":
                if (this.props.data["type"] == "video") {
                    return <YoutubeEmbed preview={this.props.preview} url={this.props.data["code"].match(/https:\/\/[^\"\s]+/)[0]}/>;
                }
                break;
            case "soundcloud.com":
                return <SoundcloudEmbed preview={this.props.preview} url={this.props.data["code"].match(/https:\/\/[^\"\s]+/)[0] + "&auto_play=true"}/>;
            case "twitch.tv":
                return <TwitchEmbed preview={this.props.preview} url={this.props.data["url"]}/>;
            case "bandcamp.com":
                return <BandCampEmbed url={this.props.data["code"].match(/https:\/\/.*album=\d+/)[0]}/>
            case "imgur.com":
                // skip default embed code if it's an imgur image
                if (this.props.data["type"] == "photo") {
                    break;
                }
            case "facebook.com":
            case "instagram.com":
            case "vimeo.com":
            case "dailymotion.com":
                // default embed code
                if (this.props.data["code"]) {
                    return <div class="embed-container" ref={e => this.embedContainer = e} dangerouslySetInnerHTML={{__html: this.props.data["code"]}}></div>;
                }
            default:
        }
        if (/image/.test(this.props.data["content-type"])) {
            return (
                <div class="container d-flex justify-content-center flex-wrap align-items-center">
                    <img
                        data-nlg={!this.props.inWriter}
                        href={this.props.url}
                        class="img-fluid cursor-pointer"
                        data-src={this.props.url}
                        src={ this.props.preview && !/gif/.test(this.props.data["content-type"]) ? util.thumbnail(this.props.preview, 1280, 720) : this.props.url }
                    />
                </div>
            );
        }
        if (/video/.test(this.props.data["content-type"])) {
            return (
                <div class="container d-flex justify-content-center flex-wrap align-items-center">
                    <video class="img-fluid" controls src={ this.props.url } />
                </div>
            );
        }
        if (this.props.data["title"] && (this.props.preview || this.props.data["description"])) {
            return (
                <a class="preview-card seamless-link d-inline-block" target="_blank" href={ this.props.url }>
                    <div class="card" style="max-width: 480px">
                        { this.props.preview && <img class="card-img-top" src={ util.crop(this.props.preview, 320, 180) } /> }
                        <div class="card-body p-1">
                            <h5>{ this.props.data["title"] }</h5>
                            { this.props.data["description"] && (
                                <p><small>{ this.props.data["description"].slice(0, 500) }</small></p>
                            )}
                        </div>
                    </div>
                </a>
            );
        }
        return null;
    }
}
