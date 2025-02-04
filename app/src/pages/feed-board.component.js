import { h } from "preact";
import { Navbar } from "/src/navbar";
import { MessageList } from "/src/message";
import {useStoreon} from "storeon/preact";
import GroupsDropdownWrite from "/src/misc/groups-dropdown-write.component";

export default function FeedBoard() {
  const { me } = useStoreon("me");

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
          <GroupsDropdownWrite groups={me.groups} />
        </div>
      </div>
    </main>
  );
}
