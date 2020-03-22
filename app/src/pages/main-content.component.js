import { h, render, Component } from "preact";
import { util, router, cache } from "/core";
import { MessageParent } from "/message";
import { CreateGroup, GroupTitle, GroupBoard, Share } from "/pages";
import { Settings } from "/settings";
import { GroupSearch } from "/navbar";
import { FaIcon } from "/misc";
import Writer from "/message/writer.component.js";

export default class MainContent extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.action == "settings") {
      return (
        <article class="mt-2 justify-content-center d-flex">
          <div class="container pb-3">
            <Settings
              key={this.props.entityUrl}
              entityUrl={this.props.entityUrl}
            />
          </div>
        </article>
      );
    }
    switch (this.props.route) {
      case "create-group":
        return <CreateGroup />;
      case "share":
        return <Share />;
      case "messages":
        return (
          <article class="mb-3 justify-content-center d-flex">
            <div class="container pb-3">
              <GroupTitle
                key={util.getGroupId()}
                id={util.getGroupId()}
                name={util.getGroupName()}
              />
              <MessageParent
                focus={!!router.getParam("focus", router.search)}
                key={router.entity.id}
                message={router.entity}
              />
            </div>
          </article>
        );
      case "groups":
        if (this.props.action == "write") {
          return (
            <article class="mb-3">
              <div class="container pb-3">
                <GroupTitle
                  key={util.getGroupId()}
                  id={util.getGroupId()}
                  name={util.getGroupName()}
                />
                <Writer focus={true} group={this.props.id} />
              </div>
            </article>
          );
        }
        if (router.getParam("search") || router.getParam("hashtags")) {
          return (
            <div>
              <GroupSearch key={this.props.id} />
            </div>
          );
        }
        return (
          <div>
            <GroupBoard key={this.props.id} />
            <a
              class="write-button material-shadow seamless-link"
              href={router.toApp("/groups/" + this.props.id + "/write")}
              onClick={e => router.onClick(e)}
            >
              <FaIcon family={"solid"} icon={"pencil-alt"} />
            </a>
          </div>
        );
      default:
    }
  }
}
