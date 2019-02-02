import { h, render, Component } from "preact";

export default class BandCampEmbed extends Component {
    render() {
        const embedUrl = this.props.url + "/size=large/bgcol=f5f5f5/linkcol=0687f5/minimal=true/tracklist=false/";
        return (
            <div class="embed-responsive embed-responsive-1by1 max-width-450px-md">
                <iframe class="embed-responsive-item" src={embedUrl}></iframe>
            </div>
        );
    }
}
