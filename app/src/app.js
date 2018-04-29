import { h, render, Component } from "preact"

class MessageCard extends Component {
    render(props) {
        return (
            <div class="card">
                <div class="card-header">
                    { props.author }
                </div>
                <div class="card-body">
                    <p class="card-text">{ props.data }</p>
                </div>
            </div>
        );
    }
}

class App extends Component {
    constructor() {
        super();
        this.state = {
            apiKey: "1f1e49e6-0d22-4e3b-9cdd-adf7bd0a53b9",
            currentMessage: null,
        }

        this.router = {
            getSegments: () => window.location.pathname.slice(1).split("/")
        }

        this.http = {
            getMessage: (id, apiKey) => fetch("/api/messages/"+id, {
                method: "GET",
                headers: new Headers({
                    "Content-type": "application/json",
                    "X-AUTH-TOKEN": apiKey,
                })
            })
        }
    }

    syncWithRoute() {
        const segments = this.router.getSegments();
        if (segments[0] === "messages" && segments[1]) {
            this.http.getMessage(segments[1], this.state.apiKey).then(
                res => res.json().then(res => {
                    this.setState({currentMessage: res});
                })
            ).catch(e => console.warn(e));
        }
    }

    render(props, state) {
        return (
            <div> {
                state.currentMessage ?
                    (
                        <MessageCard 
                            author={state.currentMessage.author}
                            data={state.currentMessage.data}
                        />
                    )
                    : ""
            } </div>
        );
    }

    componentDidMount() {
        this.syncWithRoute();
    }
}

render(<App />, document.body);
