import { h, render, Component } from "preact"
// import "babel-polyfill";

window.http = {
    apiKey: "f759248b-de35-4cc0-ae4b-f37805f72a85",
    get: url => {
        return fetch(url, {
            method: "GET",
            headers: new Headers({
                "Content-type": "application/json",
                "X-AUTH-TOKEN": http.apiKey,
            }),
        }).then(
            res => res.json()
        ).catch(
            err => console.warn(err)
        );
    },
    post: (url, data) => {
        return fetch(url, {
            method: "POST",
            body: JSON.stringify(data),
            headers: new Headers({
                "Content-type": "application/json",
                "X-AUTH-TOKEN": http.apiKey,
            }),
        }).then(
            res => res.json()
        ).catch(
            err => console.warn(err)
        );
    },
    getId: url => url.split("/").pop().replace(/\?.*$/, "").replace(/\.\w+$/, ""),
    thumbnail: (url, width, height) => "/api/images/thumbnail/" + width + "/" + height + "/" + http.getId(url),
    crop: (url, width, height) => "/api/images/crop/" + width + "/" + height + "/" + http.getId(url),
}

class PreviewBlock extends Component {
    render() {
        if (
            this.props.title
            && this.props.display
            && (this.props.image || this.props.description)
        ) {
            return (
                <a class="seamless-link" target="_blank" href={ this.props.url }>
                    <div class="card">
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

class FileGrid extends Component {
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

class MessageCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            url: props.url,
            regex: {
                link: /\b(https?:\/\/[^\s]+)\b/gi
            },
            message: {},
            author: {},
            preview: {},
            displayedChildren: [],
        }
        http.get(this.state.url).then(msg => {
            this.setState({
                message: msg,
                displayedChildren: msg.children
            });
            http.get(msg.author).then(author => {
                this.setState({author: author});
            });
            this.updatePreviewBlock(this.state.message.data);
        });
    }
    displayMessageText() {
        return {
            __html: this.state.message.data.replace(this.state.regex.link, "<a href=\"$1\">$1</a>")
        };
    }
    getFirstLink(text) {
        if (!text) {
            return null;
        }
        let matches = text.match(this.state.regex.link);
        if (matches && matches.length > 0) {
            return matches[0];
        }
        return null;
    }
    updatePreviewBlock(text) {
        let preview = {url: this.getFirstLink(text)};
        if (!preview.url) {
            return;
        }
        http.post("/api/links/by_url", {url: preview.url}).then(
            res => {
                if (res && res.data) {
                    preview.display = true;
                    preview.image = res.preview;
                    let data = JSON.parse(res.data);
                    preview.title = data["title"];
                    preview.description = data["description"];
                    this.setState({preview: preview});
                }
            }
        );
    }
    displayDate(timestamp) {
        if (!timestamp) {
            return null;
        }
        let date = new Date(timestamp*1000);
        return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
    }
    render() {
        return (
            <div class="card mb-1">
                <div class="card-header d-flex">
                    {
                        this.state.author &&
                        this.state.author.avatar &&
                        <img class="rounded w-3" src={ http.crop(this.state.author.avatar, 50, 50) }/>
                    }
                    <div class="d-flex flex-column">
                        <span class="capitalize ml-1">{ this.state.author.name }</span>
                        <span class="ml-1">{ this.displayDate(this.state.message.createdAt) }</span>
                    </div>
                </div>
                <div class="card-body">
                    { this.state.message.data && <p class="card-text" dangerouslySetInnerHTML={this.displayMessageText()}></p> }
                    <PreviewBlock {...this.state.preview} />
                    { this.state.message.files && <FileGrid files={this.state.message.files}/> }
                </div>
                {
                    this.state.displayedChildren.length > 0 &&
                    (
                        <div class="card-footer">
                            { this.state.displayedChildren.map(e => <MessageCard url={e} /> ) }
                        </div>
                    )
                }
            </div>
        );
    }
}

class App extends Component {
    constructor() {
        super();
        this.state = {
            show: null,
            url: null,
        }

        this.router = {
            getSegments: () => window.location.pathname.slice(1).split("/")
        }
    }

    syncWithRoute() {
        const segments = this.router.getSegments();
        if (segments[0] === "messages" && segments[1]) {
            this.setState({
                show: "message",
                url: "/api/" + segments[0] + "/" + segments[1],
            });
        }
    }

    render() {
        return (
            <div>
                { this.state.show === "message" && this.state.url && <MessageCard url={this.state.url} /> }
            </div>
        );
    }

    componentDidMount() {
        this.syncWithRoute();
    }
}

render(<App />, document.body);
