import { h, render, Component } from "preact";
import http from "./http.js";

export default class GroupPreview extends Component {
    constructor(props) {
        super(props);
        this.state = {
            regex: {
                link: /\b(https?:\/\/[^\s]+)\b/gi
            }
        };
        if (props.files && props.files.length > 0) {
            this.setState({preview: http.crop(props.files[0], 320, 180)});
        } else {
            if (props.data) {
                let previewUrl = props.data.match(this.state.regex.link);
                if (previewUrl) {
                    http.get("/api/links/by_url?url=" + encodeURIComponent(previewUrl[0])).then(r => {
                        return this.setState({preview: r["preview"]});
                    });
                }
            }
        }
    }

    render() {
        return (
            <a href={ "/messages/" + this.props.id }>
                <div class="card mb-1 ml-1" style="max-width: 400px">
                    { this.state.preview && <img class="card-img-top" src={ http.crop(this.state.preview, 320, 180) } /> }
                    { !this.state.preview && <img class="card-img-top" src="https://zus.am/Assets/placeholder-mini-post.png" /> }
                </div>
            </a>
        );
    }
}
