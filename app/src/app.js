import { h, app } from "hyperapp"

const state = {
    apiKey: "1f1e49e6-0d22-4e3b-9cdd-adf7bd0a53b9",
    currentMessage: null,
}

const router = {
    getSegments: () => window.location.pathname.slice(1).split("/")
}

const http = {
    getMessage: (id, apiKey) => fetch("/api/messages/"+id, {
        method: "GET",
        headers: new Headers({
            "Content-type": "application/json",
            "X-AUTH-TOKEN": apiKey,
        })
    })
}

const actions = {
    setCurrentMessage: msg => state => ({currentMessage: msg}),
    syncWithRoute: () => (state, actions) => {
        const segments = router.getSegments();
        if (segments[0] === "messages" && segments[1]) {
            http.getMessage(segments[1], state.apiKey).then(
                res => res.json().then(res => {
                    console.log(res);
                    actions.setCurrentMessage(res);
                })
            ).catch(e => console.warn(e));
        }
    }
}

const MessageCard = ({author, data}) => (
    <div class="card">
        <div class="card-header">
            { author }
        </div>
        <div class="card-body">
            <p class="card-text">{ data }</p>
        </div>
    </div>
)

const view = (state, actions) => {
    return (
        <div oncreate={() => actions.syncWithRoute()}>
            {
                state.currentMessage ? (<MessageCard author={state.currentMessage.author} data={state.currentMessage.data} />) : ""
            }
        </div>
    );
}

app(state, actions, view, document.body)
