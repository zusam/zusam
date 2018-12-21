import { h, render, Component } from "preact";
import bee from "./bee.js";

export default class BandCampEmbed extends Component {
    render() {
        if (this.state.revealed) {
            const embedUrl = this.props.url + "/size=large/bgcol=ffffff/linkcol=0687f5/tracklist=true/transparent=true/";
            return <div class="embed-responsive embed-responsive-16by9"><iframe allowfullscreen class="embed-responsive-item" src={embedUrl}></iframe></div>;
        }
        return <div class="embed-preview" onClick={() => this.setState({revealed: true})}><div class="bandcamp"></div><img src={ bee.crop(this.props.preview, 1024, 270) } /></div>;
    }
}
