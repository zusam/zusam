import { h, render, Component } from "preact"

class MessageCard extends Component {
    render() {
        console.log(this.props);
        return (
            <div class="card">
                <div class="card-header">
                    <img src={ "/files/" + this.props.author.avatar }/> <span>{ this.props.author.name }</span>
                </div>
                <div class="card-body">
                    <p class="card-text">{ this.props.text }</p>
                </div>
            </div>
        );
    }
}

class App extends Component {
    constructor() {
        super();
        this.state = {
            apiKey: "2bccc8f9-cd6f-4a7e-920e-1d6b39ad1f27",
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
                                    name: author.login,
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
