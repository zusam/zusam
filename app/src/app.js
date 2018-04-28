import { h, app } from "hyperapp"

const state = {
    apiKey: "1f1e49e6-0d22-4e3b-9cdd-adf7bd0a53b9",
    currentMessage: null,
}

const actions = {
    getCurrentMessage: id => async (state, actions) => {
        fetch("/api/messages/fffcb3e1-92e8-4a45-87bb-9f65469994f3", {
            method: "GET",
            headers: new Headers({
                "Content-type": "application/json",
                "X-AUTH-TOKEN": state.apiKey,
            })
        }).then(
            res => res.json().then(res => {
                actions.updateCurrentMessage(res);
            })
        ).catch(e => console.log(e));
    },
    updateCurrentMessage: msg => state => ({currentMessage: msg})
}

const view = (state, actions) => (
    <div>
        <button onclick={() => actions.getCurrentMessage()}>click</button>
        <pre>
            {JSON.stringify(state.currentMessage)}
        </pre>
    </div>
)

app(state, actions, view, document.body)
