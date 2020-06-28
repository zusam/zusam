import { h, Component } from "preact";
import { lang, http } from "/core";

export default class StopNotificationEmails extends Component {
  constructor() {
    super();
    http
      .get(`/api${  window.location.pathname}`)
      .then(() => {
        this.setState({ message: lang.t("notification_emails_stopped") });
      })
      .catch(err => {
        console.warn(err);
        this.setState({ message: lang.t("error") });
      });
  }

  render() {
    return <div>{this.state.message || ""}</div>;
  }
}
