import { h, render, Component } from "preact";
import bee from "./bee.js";

export default class TwitchEmbed extends Component {
    render() {
        if (this.state.revealed) {
            let embedUrl = "";
            const splits = this.props.url.split("/");
            switch (splits[2]) {
                case "www.twitch.tv":
                    embedUrl = "https://player.twitch.tv/?video=" + splits[4].replace(/\?.*$/,"");
                    break;
                case "clips.twitch.tv":
                    embedUrl = "https://clips.twitch.tv/embed?clip=" + splits[3].replace(/\?.*$/,"");
                    break;
            }
            return <div class="embed-responsive embed-responsive-16by9"><iframe allowfullscreen class="embed-responsive-item" src={embedUrl}></iframe></div>;
        }
        return <div class="embed-preview" onClick={() => this.setState({revealed: true})}><div class="twitch"></div><img src={ bee.crop(this.props.preview, 1024, 270) } /></div>;
    }
}
