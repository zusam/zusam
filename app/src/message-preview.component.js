import { h, render, Component } from "preact";
import http from "./http.js";

export default class MessagePreview extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        http.get(this.props.url).then(
            msg => {
                this.setState({message: msg});
                if (msg.files && msg.files.length > 0) {
                    this.setState({preview: http.crop(msg.files[0], 320, 180)});
                } else {
                    if (msg.data) {
                        let previewUrl = msg.data.match(/https?:\/\/[^\s]+/gi);
                        if (previewUrl) {
                            http.get("/api/links/by_url?url=" + encodeURIComponent(previewUrl[0])).then(r => {
                                return this.setState({preview: r["preview"]});
                            });
                        }
                    }
                }
            }
        );
    }

    render() {
        return this.state.message && (
            <a href={ "/messages/" + this.state.message.id }>
                <div class="card mb-1 ml-1" style="max-width: 400px">
                    { this.state.preview && <img class="card-img-top" src={ http.crop(this.state.preview, 320, 180) } /> }
                    { !this.state.preview && <img class="card-img-top" src="https://zus.am/Assets/placeholder-mini-post.png" /> }
                </div>
            </a>
        );
    }
}
