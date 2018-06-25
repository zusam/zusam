import { h, render, Component } from "preact";
import bee from "./bee.js";

export default class FileGrid extends Component {

    constructor(props) {
        super(props);
        this.state = {files: []};
        if (Array.isArray(props.files)) {
            props.files.forEach(e => {
                if (typeof(e) == "string") {
                    bee.get(e).then(r => this.setState({files: [...this.state.files, r]}));
                }
                if (typeof(e) == "object") {
                    this.setState({files: [...this.state.files, e]});
                }
            });
        }
    }

    renderFile(file, miniature = false) {
        let url = file.path;
        if (/image/.test(file.type)) {
            url = bee.thumbnail(file.path, 1024, 768);
        }
        if (miniature == true) {
            return (
                <a data-nlg href={url} class="rounded">
                    <div class="miniature" style={"background-image:url('" + bee.crop(file.path, 240, 240) + "')"}></div>
                </a>
            );
        }
        if (/video/.test(file.type)) {
            return <video class="img-fluid contained-height mb-1" controls="true" src={url}></video>
        }
        if (/image/.test(file.type)) {
            return (
                <a class="image" data-nlg href={url}>
                    <img class="img-fluid" src={url}></img>
                </a>
            );
        }
    }

    render() {
        if (!this.state.files || this.state.files.length === 0) {
            return null;
        }
        if (this.props.files && this.props.files.length > 3) {
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
        import("./nlg.js").then(nlg => nlg.default.start());
    }
}
