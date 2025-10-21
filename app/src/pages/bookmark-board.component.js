import { h } from "preact";
import { MessagePreview } from "/src/message";
import { Navbar } from "/src/navbar";
import { useStoreon } from "storeon/preact";

export default function BookmarkBoard() {

  const { t } = useTranslation();
  const { bookmarks } = useStoreon("bookmarks");

  if (!bookmarks) {
    return (
      <main>
        <Navbar />
        <div class="content">
          <article id="group" class="justify-content-center d-flex">
            <div class="message-container container-fluid d-flex justify-content-center flex-wrap">
              {t("you_have_no_bookmarks")}
            </div>
          </article>
        </div>
      </main>
    );
  }

  if (!Array.isArray(bookmarks) || bookmarks.length < 1) {
    return;
  }

  return (
    <main>
      <Navbar />
      <div class="content">
        <article id="group" class="justify-content-center d-flex">
          <div class="message-container container-fluid d-flex justify-content-center flex-wrap">
            {bookmarks.map((b, i) => {
              return (
                <MessagePreview
                  tabindex={i + 1}
                  key={b.message.id}
                  id={b.message.id}
                />
              );
            })}
          </div>
        </article>
      </div>
    </main>
  );
}
