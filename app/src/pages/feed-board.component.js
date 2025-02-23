import { h } from "preact";
import { Navbar } from "/src/navbar";
import { MessageList } from "/src/message";

export default function FeedBoard() {
  return (
    <main>
      <Navbar />
      <div class="content">
        <div>
          <div>
            <article id="group" class="justify-content-center d-flex">
              <div class="message-container container-fluid d-flex justify-content-center flex-wrap">
                <MessageList key="feed" isFeed={true} />
              </div>
            </article>
          </div>
        </div>
      </div>
    </main>
  );
}
