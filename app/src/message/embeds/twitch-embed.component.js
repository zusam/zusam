import { h, Component } from "preact";
import { router } from "/core";

export default class TwitchEmbed extends Component {
  render() {
    let embedUrl = "";
    const splits = this.props.url.split("/");
    const t = router.getParam("t", this.props.url.split("?")[1]);
    switch (splits[2]) {
      case "www.twitch.tv":
        if (splits.length > 5 && splits[4] == "clip") {
          embedUrl =
            `https://clips.twitch.tv/embed?clip=${ 
            splits[5].replace(/\?.*$/, "") 
            }&autoplay=false`;
        } else {
          embedUrl =
            `https://player.twitch.tv/?video=${ 
            splits[4].replace(/\?.*$/, "") 
            }&autoplay=false${ 
            t ? `&t=${  t}` : ""}`;
        }
        break;
      case "clips.twitch.tv":
        embedUrl =
          `https://clips.twitch.tv/embed?clip=${ 
          splits[3].replace(/\?.*$/, "") 
          }&autoplay=false`;
        break;
    }
    return (
      <div class="embed-responsive embed-responsive-16by9">
        <iframe
          allowfullscreen
          class="embed-responsive-item"
          src={embedUrl}
         />
      </div>
    );
  }
}
