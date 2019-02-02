import { h, render, Component } from "preact";

export default class TwitchEmbed extends Component {
    render() {
        let embedUrl = "";
        const splits = this.props.url.split("/");
        switch (splits[2]) {
            case "www.twitch.tv":
                embedUrl = "https://player.twitch.tv/?video=" + splits[4].replace(/\?.*$/,"") + "&autoplay=false";
                break;
            case "clips.twitch.tv":
                embedUrl = "https://clips.twitch.tv/embed?clip=" + splits[3].replace(/\?.*$/,"") + "&autoplay=false";
                break;
        }
        return <div class="embed-responsive embed-responsive-16by9"><iframe allowfullscreen class="embed-responsive-item" src={embedUrl}></iframe></div>;
    }
}
