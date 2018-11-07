import { h, render, Component } from "preact";
import bee from "./bee.js";
import nlg from "./nlg.js";

export default class FileGrid extends Component {

    constructor(props) {
        super(props);
        this.state = {files: []};
        if (Array.isArray(props.files)) {
            props.files.forEach((e,i) => {
                if (typeof(e) == "string") {
                    bee.get(e).then(r => {
                        let a = this.state.files;
                        a.splice(r.fileIndex, 0, r);
                        this.setState({files: a})
                    });
                }
                if (typeof(e) == "object") {
                    let a = this.state.files;
                    a.splice(e.fileIndex, 0, e);
                    this.setState({files: a});
                }
            });
        }
    }

    renderFile(file, miniature = false) {
        let filePath = "/files/" + file.contentUrl;
        let url = filePath;
        if (/image/.test(file.type)) {
            url = bee.thumbnail(filePath, 1366, 768);
        }
        if (miniature == true) {
            return (
                <a data-nlg href={url} class="rounded">
                    <div class="miniature" style={"background-image:url('" + bee.crop(filePath, 160, 160) + "')"}></div>
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
        if (!this.props.files || this.props.files.length === 0) {
            return null;
        }
        if (this.props.files && this.props.files.length > 3) {
            return (
                <div class="file-grid">
                    { this.state.files.sort((a, b) => a.fileIndex > b.fileIndex ? 1 : -1).map(e => this.renderFile(e, true)) }
                </div>
            );
        }
        return (
            <div class="container d-flex justify-content-center flex-wrap">
            { this.state.files.sort((a, b) => a.fileIndex > b.fileIndex ? 1 : -1).map(e => this.renderFile(e)) }
            </div>
        );
    }

    componentDidMount() {
        nlg.start();
    }

    componentDidUpdate() {
        nlg.start();
    }
}
