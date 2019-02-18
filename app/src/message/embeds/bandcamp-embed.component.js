import { h, render, Component } from "preact";

export default class BandCampEmbed extends Component {
    render() {
        const embedUrl = this.props.url + "/size=large/bgcol=f5f5f5/linkcol=0687f5/minimal=true/tracklist=false/";
        return (
            <div class="bandcamp-embed embed-responsive embed-responsive-1by1">
                <iframe class="embed-responsive-item" src={embedUrl}></iframe>
            </div>
        );
    }
}
