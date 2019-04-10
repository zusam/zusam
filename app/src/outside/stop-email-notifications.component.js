import { h, render, Component } from "preact";
import { http } from "/core";

export default class StopEmailNotifications extends Component {

    constructor() {
        super();
        this.state = {message: ""};
        http.get("/api/" + window.location.pathname).then(res => {
            this.setState({message: lang["email_notifications_stopped"]});
        }).catch(err => {
            console.warn(err);
            this.setState({message: lang["error"]});
        });
    }
    
    render() {
        return <div>{this.state.message}</div>;
    }
}
