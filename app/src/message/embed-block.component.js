import { h, render, Component } from "preact";
import { util, router } from "/core";
import TwitchEmbed from "./embeds/twitch-embed.component.js";
import BandCampEmbed from "./embeds/bandcamp-embed.component.js";
import GenericEmbed from "./embeds/generic-embed.component.js";

export default class EmbedBlock extends Component {

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

    getPreview() {
        if (this.props.data["providerUrl"]) {
            switch (this.props.data["providerUrl"].toLowerCase().replace(/\/$/, '').replace(/^https?:\/\/(www\.)?/, '')) {
                case "gamerdvr.com":
                    if (this.props.data["url"].match(/\/gamer\/\w+\/video\//)) {
                        return (
                            <GenericEmbed
                                preview={util.crop(this.props.preview.id, 1024, 270)}
                                url={this.props.data["url"] + "/embed"}
                                playBtnClass={"gamerdvr"}
                            />
                        );
                    }
                    break;
                case "youtube.com":
                    if (this.props.data["type"] == "video" && this.props.data["code"]) {
                        return (
                            <GenericEmbed
                                preview={util.crop(this.props.preview.id, 1024, 270)}
                                url={this.props.data["code"].match(/https:\/\/[^\"\s]+/)[0] + "&autoplay=1&controls=2&wmode=opaque"}
                                playBtnClass={"youtube"}
                            />
                        );
                    }
                    break;
                case "soundcloud.com":
                    if (this.props.data["code"]) {
                        return (
                            <GenericEmbed
                                preview={util.crop(this.props.preview.id, 1024, 270)}
                                url={this.props.data["code"].match(/https:\/\/[^\"\s]+/)[0] + "&auto_play=true"}
                                playBtnClass={"soundcloud"}
                            />
                        );
                    }
                case "twitch.tv":
                    return <TwitchEmbed preview={this.props.preview} url={this.props.data["url"]}/>;
                case "bandcamp.com":
                    if (this.props.data["code"]) {
                        return <BandCampEmbed url={this.props.data["code"].match(/https:\/\/.*album=\d+/)[0]}/>;
                    }
                case "imgur.com":
                    // skip default embed code if it's an imgur image
                    if (this.props.data["type"] == "photo") {
                        break;
                    }
                case "vimeo.com":
                case "dailymotion.com":
                case "facebook.com":
                    // default embed code
                    if (this.props.data["code"]) {
                        return (
                            <div class="embed-container"
                                ref={e => this.embedContainer = e}
                                dangerouslySetInnerHTML={{__html: this.props.data["code"]}}
                            ></div>
                        );
                    }
                default:
            }
        }
        if (this.props.data["providerName"]) {
            switch (this.props.data["providerName"].toLowerCase()) {
                case "peertube":
                    // default embed code
                    if (this.props.data["code"]) {
                        return (
                            <div class="embed-container"
                                ref={e => this.embedContainer = e}
                                dangerouslySetInnerHTML={{__html: this.props.data["code"]}}
                            ></div>
                        );
                    }
                default:
            }
        }
        if (/image/.test(this.props.data["content-type"])) {
            return (
                <div class="container d-flex justify-content-center flex-wrap align-items-center">
                    <img
                        data-nlg={!this.props.inWriter}
                        href={router.toApp(this.props.url)}
                        class="img-fluid cursor-pointer"
                        data-src={this.props.url}
                        src={ this.props.preview && !/gif/.test(this.props.data["content-type"]) ? util.thumbnail(this.props.preview.id, 1366, 99999) : this.props.url }
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
                <a class="preview-card seamless-link d-inline-block" target="_blank" href={router.toApp(this.props.url)}>
                    <div class="card" style="max-width: 480px">
                        { this.props.preview && <img class="card-img-top" src={ util.crop(this.props.preview.id, 320, 180) } /> }
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

    render() {
        if (!this.props.url || !this.props.data) {
            return null;
        }
        let preview = this.getPreview();
        if (preview) {
            return (
                <p class="text-center card-text">
                    { preview }
                </p>
            );
        }
        return null;
    }
}
