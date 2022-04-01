import { h } from "preact";
import { me as meService, router, http } from "/src/core";
import { Writer } from "/src/writer";
import { Navbar } from "/src/navbar";
import { useStoreon } from "storeon/preact";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "preact/hooks";

export default function Share() {

  const params = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { me } = useStoreon("me");
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState(searchParams.get("title") || "");
  const [text, setText] = useState(searchParams.get("text") || "");
  const [url, setUrl] = useState(searchParams.get("url") || "");
  const [parent, setParent] = useState(searchParams.get("parent") || "");
  const [files, setFiles] = useState([]);
  const [group, setGroup] = useState("");

  useEffect(() => {
    setTimeout(() => {
      meService.fetch().then(user => {
        if (user.data["default_group"]) {
          setGroup(user.data["default_group"])
        } else if (user.groups.length == 1) {
          setGroup(user.groups[0]["id"])
        }
        if (searchParams.get("message")) {
          http.get(`/api/messages/${searchParams.get("message")}`)
            .then(m => {
              setTitle(m && m.data.title || "");
              setText(m && m.data.text || "");
              setUrl("");
              setFiles(m && m.files || []);
              setLoaded(true);
            });
        } else {
          setLoaded(true);
        }
      });
    }, 100);
  }, []);

  if (!loaded) {
    return;
  }

  return (
    <main>
      <Navbar />
      <div class="content">
        <article class="mt-2">
          <div class="container">
            {!parent && me?.groups?.length > 1 && (
              <div class="mb-1">
                <label class="px-1" for="group_share_choice">
                  {t("group_share_choice")}
                </label>
                <select
                  value={group}
                  class="form-select"
                  name="group_share_choice"
                  onChange={e => setGroup(e.target.value)}
                  required
                >
                  {me?.groups.map(e => (
                    <option key={e["id"]} value={e["id"]}>{e.name}</option>
                  ))}
                </select>
              </div>
            )}
            {!!parent && (
              <div class="form-group">
                <label for="apiKey">
                  {t("parent_message")}:{" "}
                </label>
                <input
                  type="text"
                  name="parent_message"
                  value={parent}
                  class="form-control font-size-80"
                  readonly="readonly"
                />
              </div>
            )}
            <Writer
              focus={true}
              group={group}
              title={title}
              parent={parent}
              text={text || url ? `${text}\n${url}` : ""}
              files={files}
            />
          </div>
        </article>
      </div>
    </main>
  );
}
