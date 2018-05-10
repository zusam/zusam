import { h, render, Component } from "preact"

window.http = {
    apiKey: "d7f59396-67e0-4364-98a0-5586c841e25e",
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
    thumbnail: (url, width, height) => "/api/images/thumbnail/" + width + "/" + height + "/" + url.split("/")[2],
    crop: (url, width, height) => "/api/images/crop/" + width + "/" + height + "/" + url.split("/")[2],
}

class PreviewBlock extends Component {
    render() {
        return (
            <a class="seamless-link" target="_blank" href={ this.props.url }>
                <div class="card">
                    <img class="card-img-top" src={ http.crop(this.props.image, 320, 180) } />
                    <div class="card-body">
                        <h5>{ this.props.title }</h5>
                        <p><small>{ this.props.description }</small></p>
                    </div>
                </div>
            </a>
        );
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
            author_avatar: "",
            preview: {}
        }
        http.get(this.state.url).then(msg => {
            this.setState({message: msg});
            this.updatePreviewBlock(this.state.message.data);
            http.get(msg.author).then(author => {
                this.setState({author: author});
                http.get(author.avatar).then(avatar => this.setState({author_avatar: avatar.id + avatar.extension}))
            });
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
            <div class="card">
                <div class="card-header d-flex">
                    <img class="rounded w-3" src={ "/files/" + this.state.author_avatar }/>
                    <div class="d-flex flex-column">
                        <span class="capitalize ml-1">{ this.state.author.name }</span>
                        <span class="ml-1">{ this.displayDate(this.state.message.createdAt) }</span>
                    </div>
                </div>
                <div class="card-body">
                    { this.state.message.data ? (<p class="card-text" dangerouslySetInnerHTML={this.displayMessageText()}></p>): null }
                    { this.state.preview.display ? <PreviewBlock {...this.state.preview} /> : null}
                </div>
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
                { this.state.show === "message" && this.state.url ? (<MessageCard url={this.state.url} />) : null }
            </div>
        );
    }

    componentDidMount() {
        this.syncWithRoute();
    }
}

render(<App />, document.body);
