import { h, render, Component } from "preact";
import nlg from "./nlg.js";
import bee from "./bee.js";

export default class FileGrid extends Component {

	constructor(props) {
		super(props);
		this.state = {files: []};
		if (props.files && props.files.length > 0) {
			props.files.forEach(e => bee.get(e).then(r => this.setState({files: [...this.state.files, r]})))
		}
	}

    renderFile(file, miniature = false) {
        let url = /image/.test(file.path) ? bee.thumbnail(file.path, 1024, 1024) : file.path;
        if (miniature == true) {
            return (
                <a data-nlg href={url}>
                    <img class="rounded img-fluid" src={ bee.crop(file.path, 240, 240) } />
                </a>
            );
        }
        if (/video/.test(file.type)) {
            return <video class="img-fluid contained-height" controls="true" src={url}></video>
        }
        if (/image/.test(file.type)) {
            return <img class="rounded mb-1" src={url}></img>
        }
    }

    render() {
        if (!this.state.files || this.state.files.length === 0) {
            return null;
        }
        if (this.state.files.length > 3) {
            return (
                <div class="file-grid">
                    { this.state.files.map(e => this.renderFile(e, true)) }
                </div>
            );
        }
        return (
            <div class="container d-flex justify-content-center flex-wrap">
                { this.state.files.map(e => this.renderFile(e)) }
            </div>
        );
    }

    componentDidUpdate() {
        // start the nano-lightbox-gallery
        nlg.start();
    }
}
