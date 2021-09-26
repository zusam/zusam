import { h, Component } from "preact";
import { http } from "/src/core";
import { withTranslation } from 'react-i18next';

class StopNotificationEmails extends Component {
  constructor() {
    super();
    http
      .get(`/api${  window.location.pathname}`)
      .then(() => {
        this.setState({ message: this.props.t("notification_emails_stopped") });
      })
      .catch(err => {
        console.warn(err);
        this.setState({ message: this.props.t("error") });
      });
  }

  render() {
    return <div>{this.state.message || ""}</div>;
  }
}

export default withTranslation()(StopNotificationEmails);
