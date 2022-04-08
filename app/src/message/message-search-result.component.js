import { h } from "preact";
import { http, util, notifications } from "/src/core";
import { FaIcon } from "/src/misc";
import { Link } from "react-router-dom";
import { useEffect, useState } from "preact/hooks";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function MessageSearchResult(props) {

  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [message, setMessage] = useState(props.message);
  const [title, setTitle] = useState(props.message.data["title"] || "");
  const [text, setText] = useState(props.message.data["text"] || "");
  const [preview, setPreview] = useState(props.message["preview"] || null);

  useEffect(() => {
    if (props.message.author) {
      http.get(`/api/users/${props.message.author}`).then(author => author && setAuthor(author));
    }
  }, []);

  const displayAuthorName = () => {
    if (!author) {
      return { __html: "--" };
    }
    let authorName = author.name;

    // make the search terms stand out
    let words = authorName.split(" ");
    for (let j = 0; j < words.length; j++) {
      if (!words[j].match(util.urlRegExp)) {
        let searchTerms = props.search.split(" ");
        for (let k = 0; k < searchTerms.length; k++) {
          words[j] = words[j].replace(
            new RegExp(util.escapeRegex(searchTerms[k]), "gi"),
            "<b>$&</b>"
          );
        }
      }
    }
    authorName = words.join(" ");
    return { __html: authorName };
  };

  const displayMessageTitle = () => {
    if (!props?.message?.data?.title) {
      return { __html: util.humanTime(props?.message?.lastActivityDate) };
    }
    // escape html a little (just enough to avoid xss I hope)
    let title = props.message.data.title.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();

    // make the search terms stand out
    let words = title.split(" ");
    let searchTerms = props.search.split(" ");
    for (let j = 0; j < words.length; j++) {
      if (!words[j].match(util.urlRegExp)) {
        for (let k = 0; k < searchTerms.length; k++) {
          words[j] = words[j].replace(new RegExp(util.escapeRegex(searchTerms[k]), "gi"), "<b>$&</b>");
        }
      }
    }
    title = words.join(" ");
    return { __html: title };
  };

  const displayMessageText = () => {
    if (!props.message.data || !props.message.data["text"]) {
      return "";
    }

    // escape html a little (just enough to avoid xss I hope)
    let txt = props.message.data["text"]
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .trim();

    // make the search terms stand out for not url words
    let lines = txt.split("\n");
    for (let i = 0; i < lines.length; i++) {
      let words = lines[i].split(" ");
      for (let j = 0; j < words.length; j++) {
        if (!words[j].match(util.urlRegExp)) {
          let searchTerms = props.search.split(" ");
          for (let k = 0; k < searchTerms.length; k++) {
            if (!searchTerms[k]) {
              continue;
            }
            words[j] = words[j].replace(
              new RegExp(util.escapeRegex(searchTerms[k]), "gi"),
              "<b>$&</b>"
            );
          }
          let hashtags = props.hashtags.split(" ");
          for (let k = 0; k < hashtags.length; k++) {
            if (!hashtags[k]) {
              continue;
            }
            words[j] = words[j].replace(
              new RegExp(`#${  hashtags[k]}`, "gi"),
              "<b>$&</b>"
            );
          }
        }
      }
      lines[i] = words.join(" ");
    }
    txt = lines.join("\n");

    // replace url by real links
    let shift = 0;
    let match = null;
    while ((match = util.getUrl(txt.slice(shift)))) {
      let url = match[0];
      if (url.length >= 50) {
        url = `${url.slice(0, 25)  }...${  url.slice(-24)}`;
      }
      let searchTerms = props.search.split(" ");
      for (let i = 0; i < searchTerms.length; i++) {
        url = url.replace(new RegExp(util.escapeRegex(searchTerms[i]), "gi"), "<b>$&</b>");
      }
      let link = `<a href="${  match[0]  }" target="_blank">${  url  }</a>`;
      txt =
        txt.slice(0, match["index"] + shift) +
        link +
        txt.slice(match["index"] + shift + match[0].length);
      shift += match["index"] + link.length;
    }

    // replace line returns
    txt = txt.replace(/\n/g, "<br/>");

    return { __html: txt };
  };

  const getMiniature = () => {
    if (preview) {
      return (
        <div
          class="card-miniature"
          style={
            `background-image: url('${ 
              util.crop(preview, 100, 100) 
            }')`
          }
        />
      );
    }
    let avatar = util.defaultAvatar;
    if (
      author &&
      author.avatar &&
      author.avatar.id
    ) {
      avatar = util.crop(author.avatar["id"], 100, 100);
    }
    return (
      <div
        class="card-miniature"
        style={`background-image: url('${  avatar  }')`}
      />
    );
  };

  const getLink = () => {
    if (message.parent && message.children == 0) {
      return (
        `/messages/${message.parent}/${message.id}`
      );
    }
    return `/messages/${message.id}`;
  };

  return (
    <Link
      class="d-inline-block seamless-link message-preview unselectable"
      to={getLink()}
      title={title}
    >
      <div tabindex={props.tabindex} class="card material-shadow-with-hover">
        <div class="card-body border-top">
          {getMiniature()}
          <div class="infos">
            <div
              class="title"
              dangerouslySetInnerHTML={displayAuthorName()}
            />
            <div class="dot">&bull;</div>
            <div
              class="title"
              title={
                title ||
                util.humanFullDate(message.lastActivityDate)
              }
              dangerouslySetInnerHTML={displayMessageTitle()}
            />
          </div>
          <div class="text">
            {text.trim() && (
              <p
                class="card-text"
                dangerouslySetInnerHTML={displayMessageText()}
              />
            )}
          </div>
          <div class="children">
            {!!message.children && (
              <span>
                {`${message.children  } `}
                <FaIcon
                  family={
                    notifications.isNew(message.id) ? "solid" : "regular"
                  }
                  icon={"comment"}
                />
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
