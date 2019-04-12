import { h, render, Component } from "preact";
import { http } from "/core";

export default class StopNotificationEmails extends Component {

    constructor() {
        super();
        this.state = {message: ""};
        http.get("/api/" + window.location.pathname).then(res => {
            this.setState({message: lang["notification_emails_stopped"]});
        }).catch(err => {
            console.warn(err);
            this.setState({message: lang["error"]});
        });
    }
    
    render() {
        return <div>{this.state.message}</div>;
    }
}
