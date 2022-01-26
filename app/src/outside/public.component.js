import { h } from "preact";
import { Message } from "/src/message";
import { useParams } from "react-router-dom";

export default function Public() {
  let params = useParams();

  return (
    <article class="justify-content-center d-flex mt-2">
      <div class="container">
        <main>
          <div class="content">
            <article class="mb-3 justify-content-center d-flex">
              <div class="container pb-3">
                <Message
                  focus={false}
                  isPublic={true}
                  isChild={false}
                  token={params.token}
                />
              </div>
            </article>
          </div>
        </main>
      </div>
    </article>
  );
}
