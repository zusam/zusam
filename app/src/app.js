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

const view = (state, actions) => (
    <div oncreate={() => actions.syncWithRoute()}>
        <pre>
            {JSON.stringify(state.currentMessage)}
        </pre>
    </div>
)

app(state, actions, view, document.body)
