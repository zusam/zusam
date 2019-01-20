import { h, render, Component } from "preact";
import util from "./util.js";

export default class SoundcloudEmbed extends Component {
    render() {
        if (this.state.revealed) {
            return <div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" src={this.props.url}></iframe></div>;
        }
        return <div class="embed-preview" onClick={() => this.setState({revealed: true})}><div class="soundcloud"></div><img src={ util.crop(this.props.preview, 1024, 270) } /></div>;
    }
}
