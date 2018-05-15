import { h, render, Component } from "preact";
import http from "./http.js";

export default class PreviewBlock extends Component {

    render() {
        if (
            this.props.title
            && this.props.display
            && (this.props.image || this.props.description)
        ) {
            return (
                <a class="seamless-link" target="_blank" href={ this.props.url }>
                    <div class="card" style="max-width: 480px">
                        { this.props.image && <img class="card-img-top" src={ http.crop(this.props.image, 320, 180) } /> }
                        <div class="card-body">
                            <h5>{ this.props.title }</h5>
                            <p><small>{ this.props.description }</small></p>
                        </div>
                    </div>
                </a>
            );
        }
        return null;
    }
}
