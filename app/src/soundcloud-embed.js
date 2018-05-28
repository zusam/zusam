import { h, render, Component } from "preact";
import http from "./http.js";

export default class SoundcloudEmbed extends Component {
    render() {
        if (this.state.revealed) {
            return <div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" src={this.props.url}></iframe></div>;
        }
        return <div class="embed-preview" onClick={() => this.setState({revealed: true})}><div class="soundcloud"></div><img src={ http.crop(this.props.preview, 320, 180) } /></div>;
    }
}
