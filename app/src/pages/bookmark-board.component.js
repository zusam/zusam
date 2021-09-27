import { h, Component } from "preact";
import { util, http, me } from "/src/core";
import { MessagePreview } from "/src/message";
import { connectStoreon } from 'storeon/preact';

function BookmarkBoard() {

  if (!Array.isArray(me.data?.bookmarks) || me.data?.bookmarks.length < 1) {
    return;
  }

  return (
    <div>
      <article id="group" class="justify-content-center d-flex">
        <div class="message-container container-fluid d-flex justify-content-center flex-wrap">
          {me.data?.bookmarks.map((id, i) => {
            return (
              <MessagePreview
                tabindex={i + 1}
                key={id}
                id={id}
              />
            );
          })}
        </div>
      </article>
    </div>
  );
}

export default connectStoreon('me', BookmarkBoard);
