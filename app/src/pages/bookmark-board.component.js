import { h } from "preact";
import { MessagePreview } from "/src/message";
import { Navbar } from "/src/navbar";
import { useStoreon } from 'storeon/preact'

export default function BookmarkBoard() {

  const { me } = useStoreon('me')

  if (!Array.isArray(me?.data?.bookmarks) || me?.data?.bookmarks.length < 1) {
    return;
  }

  return (
    <main>
      <Navbar />
      <div class="content">
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
    </main>
  );
}
