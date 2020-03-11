import { h, render, Component } from "preact";
import { router } from "/core";

export default class GroupTitle extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <a
        href={router.toApp("/groups/" + this.props.id)}
        onClick={e => router.onClick(e)}
        class="no-decoration"
      >
        <div class="group-name">{this.props.name}</div>
      </a>
    );
  }
}
