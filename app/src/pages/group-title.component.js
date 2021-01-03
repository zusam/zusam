import { h } from "preact";
import { router } from "/core";

export default function GroupTitle() {
  return (
    <a
      href={router.toApp(`/groups/${  this.props.id}`)}
      onClick={e => router.onClick(e)}
      class="no-decoration"
    >
      <div class="group-name">{this.props.name}</div>
    </a>
  );
}
