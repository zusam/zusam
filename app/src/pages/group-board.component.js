import { h } from "preact";
import { FaIcon } from "/src/misc";
import { Navbar } from "/src/navbar";
import { MessageList } from "/src/message";
import { Link, useParams } from "react-router-dom";

export default function GroupBoard() {
  let params = useParams();
  return (
    <main>
      <Navbar />
      <div class="content">
        <div>
            <div>
              <article id="group" class="justify-content-center d-flex">
                <div class="message-container container-fluid d-flex justify-content-center flex-wrap">
                  <MessageList key={params.id} id={params.id} />
                </div>
              </article>
            </div>
          <Link
            class="write-button material-shadow seamless-link"
            to={`/groups/${this.props.id}/write`}
          >
            <FaIcon family={"solid"} icon={"pencil-alt"} />
          </Link>
        </div>
      </div>
    </main>
  );
}
