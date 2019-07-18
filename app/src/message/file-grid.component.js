import { h, render, Component } from "preact";
import { cache, nlg, util } from "/core";
import FaIcon from "../components/fa-icon.component.js";

export default class FileGrid extends Component {

    constructor(props) {
        super(props);
        this.state = {files: []};
        this.toggleFile = this.toggleFile.bind(this);
        if (Array.isArray(props.files)) {
            props.files.forEach((e,i) => {
                if (typeof(e) == "string") {
                    cache.get(e).then(r => {
                        let a = this.state.files;
                        if (r.fileIndex == null) {
                            r.fileIndex = i;
                        }
                        a.splice(r.fileIndex, 0, r);
                        this.setState({files: a})
                    });
                }
                if (typeof(e) == "object") {
                    let a = this.state.files;
                    if (e.fileIndex == null) {
                        e.fileIndex = i;
                    }
                    a.splice(e.fileIndex, 0, e);
                    this.setState({files: a});
                }
            });
        }
    }

    toggleFile(evt, fileIndex) {
        evt.stopPropagation();
        evt.preventDefault();
        if (typeof(this.props.toggleFile) == "function") {
            this.props.toggleFile(evt.currentTarget.getAttribute("fileIndex"));
        }
    }

    renderFile(file, miniature = false) {
        let filePath = file.contentUrl ? "/files/" + file.contentUrl : null;
        let url = filePath;
        if (/image/.test(file.type) && file.type != "image/gif") {
            url = util.thumbnail(file.id, 1366, 768);
        }
        if (miniature == true) {
            if (file.status == "ready") {
                return (
                    <a
                        data-nlg={!this.props.inWriter}
                        data-origin={filePath}
                        href={!this.props.inWriter && url}
                        class="rounded"
                    >
                        <div
                            className={"miniature" + (file.removed ? " removed" : "")}
                            style={"background-image:url('" + util.crop(file.id, 160, 160) + "')"}
                        ></div>
                        <div
                            class="remove-button"
                            style={file.removed ? "color:red" : ""}
                            fileIndex={file.fileIndex}
                            onClick={this.toggleFile}
                        >
                            <FaIcon family={"solid"} icon={"times"}/>
                        </div>
                    </a>
                );
            }
            if (file.status == "raw") {
                return (
                    <a class="rounded">
                        <div class="miniature"><FaIcon family={"regular"} icon={"check-circle"} /></div>
                    </a>
                );
            }
            return (
                <a class="rounded">
                    <div class="miniature video-raw" style={"background-image:url('" + util.crop(file.id, 160, 160) + "')"}></div>
                    <div class="spinner orange-spinner"><div></div><div></div><div></div><div></div><div></div></div>
                </a>
            );
        }
        if (file.contentUrl) {
            if (/video/.test(file.type)) {
                if (file.status == "ready") {
                    return <video
                        poster={util.thumbnail(file.id, 1280, 720)}
                        class="img-fluid contained-height video"
                        controls="true"
                        src={url}
                    ></video>;
                }
                return (
                    <a class="image video-uploaded">
                        <img class="img-fluid video-raw" src={util.crop(file.id, 320, 180)}></img>
                        <div class="spinner orange-spinner"><div></div><div></div><div></div><div></div><div></div></div>
                    </a>
                );
            }
            if (/image/.test(file.type)) {
                return (
                    <a
                        data-nlg={!this.props.inWriter}
                        data-origin={filePath}
                        href={!this.props.inWriter && url}
                        className={"image" + (file.removed ? " removed" : "")}
                    >
                        <img class="img-fluid" src={url}></img>
                        <div
                            class="remove-button"
                            style={file.removed ? "color:red" : ""}
                            fileIndex={file.fileIndex}
                            onClick={this.toggleFile}
                        >
                            <FaIcon family={"solid"} icon={"times"}/>
                        </div>
                    </a>
                );
            }
        }
        return (
            <div class="file-placeholder">
                <div class="spinner orange-spinner"><div></div><div></div><div></div><div></div><div></div></div>
                <div class="progress-bar"><div style={{width: file.progress + "%"}}></div></div>
            </div>
        );
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
            <div class="d-flex justify-content-center flex-wrap">
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
