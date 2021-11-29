import { h } from "preact";
import { router } from "/src/core";
import Message from "./message.component.js";
import { Navbar } from "/src/navbar";
import { useParams } from "react-router-dom";

export default function MessageParent(props) {
  let params = useParams();
  return (
    <main>
      <Navbar />
      <div class="content">
        <article class="mb-3 justify-content-center d-flex">
          <div class="container pb-3">
            <Message
              focus={!!router.getParam("focus", router.search)}
              isPublic={false}
              isChild={false}
              message={props?.message}
              id={params.id}
              key={params.id}
             />
          </div>
        </article>
      </div>
    </main>
  );
}
