import { h, Component } from "preact";

export default class GenericEmbed extends Component {
  render() {
    if (this.state.revealed) {
      return (
        <div class="embed-responsive embed-responsive-16by9">
          <iframe
            allowfullscreen
            class="embed-responsive-item"
            referrerpolicy="strict-origin-when-cross-origin"
            src={this.props.url}
          />
        </div>
      );
    }
    return (
      <div
        class="embed-preview"
        onClick={() => this.setState({revealed: true})}
      >
        <div className={this.props.playBtnClass} />
        <img src={this.props.preview} />
      </div>
    );
  }
}
