import { h, render, Component } from "preact";
import nlg from "./nlg.js";
import http from "./http.js";

export default class FileGrid extends Component {

	constructor(props) {
		super(props);
		this.state = {files: []};
		if (props.files && props.files.length > 0) {
			props.files.forEach(e => http.get(e).then(r => this.setState({files: [...this.state.files, r]})))
		}
	}

    render() {
        if (!this.state.files || this.state.files.length === 0) {
            return null;
        }
        return (
            <div class="file-grid">
                { this.state.files.map(e => {
					let url = /\.jpg$/.test(e.path) ? http.thumbnail(e.path, 1024, 1024) : e.path;
					return (
						<a data-nlg href={ url }>
							<img src={ http.crop(e.path, 240, 240) } />
						</a>
					);
				})}
            </div>
        );
    }

    componentDidUpdate() {
        // start the nano-lightbox-gallery
        nlg.start();
    }
}
