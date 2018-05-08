import { h, render, Component } from "preact"

class MessageCard extends Component {
    displayLinks(text) {
        return {
            __html: text.replace(/ (https?:\/\/[^\s]+)/gi, " <a href=\"$1\">$1</a>")
        };
    }
    render() {
        return (
            <div class="card">
                <div class="card-header">
                    <img class="w-3" src={ "/files/" + this.props.author.avatar }/> <span class="capitalize ml-1">{ this.props.author.name }</span>
                </div>
                <div class="card-body">
                    <p class="card-text" dangerouslySetInnerHTML={this.displayLinks(this.props.text)}></p>
                </div>
            </div>
        );
    }
}

class App extends Component {
    constructor() {
        super();
        this.state = {
            apiKey: "87c601fe-98cb-4757-8f9e-4b8200707296",
            currentMessage: null,
        }

        this.router = {
            getSegments: () => window.location.pathname.slice(1).split("/")
        }

        this.http = {
            get: url => {
                return fetch(url, {
                    method: "GET",
                    headers: new Headers({
                        "Content-type": "application/json",
                        "X-AUTH-TOKEN": this.state.apiKey,
                    }),
                }).then(
                    res => res.json()
                ).catch(
                    err => console.warn(err)
                );
            }
        }
    }

    syncWithRoute() {
        const segments = this.router.getSegments();
        if (segments[0] === "messages" && segments[1]) {
            this.http.get("/api/" + segments[0] + "/" + segments[1]).then(msg =>
                this.http.get(msg.author).then(author =>
                    this.http.get(author.avatar).then(avatar =>
                        this.setState({
                            currentMessage: {
                                author: {
                                    name: author.name,
                                    avatar: avatar.id + avatar.extension
                                },
                                text: msg.data
                            }
                        })
                    )
                )
            );
        }
    }

    render(_, state) {
        return (
            <div> {
                state.currentMessage ?  (<MessageCard {...state.currentMessage} />) : ""
            } </div>
        );
    }

    componentDidMount() {
        this.syncWithRoute();
    }
}

render(<App />, document.body);
