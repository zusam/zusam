import { h } from "preact";
import { router } from "/src/core";
import Message from "./message.component.js";
import { Navbar } from "/src/navbar";

export default function MessageParent() {
  return (
    <main>
      <Navbar />
      <div class="content">
        <article class="mb-3 justify-content-center d-flex">
          <div class="container pb-3">
            <Message
              focus={!!router.getParam("focus", router.search)}
              isPublic={this.props.isPublic}
              isChild={false}
              id={this.props.id}
             />
          </div>
        </article>
      </div>
    </main>
  );
}
