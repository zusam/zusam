import { h } from "preact";
import { util, router } from "/src/core";
import { useState, useEffect } from "preact/hooks";
import BandCampEmbed from "./bandcamp-embed.component.js";
import InstagramEmbed from "./instagram-embed.component.js";
import GenericEmbed from "./generic-embed.component.js";
import GLightbox from "glightbox";

export default function EmbedBlock(props) {

  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    setLightbox(GLightbox({
      autoplayVideos: false,
      draggable: true,
      loop: false,
      touchNavigation: true,
      zoomable: true,
      elements: [],
    }));
  }, []);

  const openLightbox = evt => {
    evt.preventDefault();
    evt.stopPropagation();
    if (lightbox != null && Array.from(document.getElementsByClassName("glightbox")).length > 0) {
      const elements = Array.from(document.getElementsByClassName("glightbox")).map(e => {
        const r = {href: e.href};
        if (e?.dataset?.width) {
          r.width = e?.dataset?.width;
        }
        if (e?.dataset?.height) {
          r.height = e?.dataset?.height;
        }
        if (e?.dataset?.type) {
          r.type = e?.dataset?.type;
        }
        if (e?.dataset?.srcset) {
          r.srcset = e?.dataset?.srcset;
        }
        if (e?.dataset?.sizes) {
          r.sizes = e?.dataset?.sizes;
        }
        return r;
      });
      lightbox.setElements(elements);
      lightbox.open(null, elements.findIndex(e => e.href === evt.target.closest(".glightbox").href));
    }
  };

  const getPreview = () => {
    if (props?.data?.exception) {
      console.warn(props.data);
    }
    if (props.data["providerName"]) {
      if ("peertube" == props.data["providerName"].toLowerCase()) {
        // default embed code
        if (props.data["code"]) {
          return (
            <div class="embed-container" dangerouslySetInnerHTML={{ __html: props.data["code"] }} />
          );
        }
      }
      if ("soundcloud" == props.data["providerName"].toLowerCase()) {
        if (props.data["code"]) {
          return (
            <GenericEmbed
              preview={util.crop(props.preview.id, 1024, 270)}
              url={
                `${props.data["code"].match(/https:\/\/[^"\s]+/)[0] 
                }&auto_play=true`
              }
              playBtnClass={"soundcloud"}
            />
          );
        }
      }
      if ("instagram" == props.data["providerName"].toLowerCase()) {
        return (
          <InstagramEmbed
            url={props.data["url"]}
            preview={util.crop(props.preview.id, 1024, 1024)}
            title={props.data["title"]}
            description={props.data["description"]}
          />
        );
      }
      if (props.data["providerUrl"] == "https://bandcamp.com") {
        if (props.data["code"]) {
          let id = props.data["code"].match(/https:\/\/.*album=\d+/);
          if (!id) {
            id = props.data["code"].match(/https:\/\/.*track=\d+/);
          }
          if (id) {
            return (
              <BandCampEmbed
                preview={util.crop(props.preview.id, 1024, 270)}
                url={id[0]}
              />
            );
          }
        }
      }
      if ("lichess.org" == props.data["providerName"].toLowerCase()) {
        let url = props?.data?.url && typeof(props?.data.url) == "string" ? props.data?.url : props.url;
        if (util.isValidUrl(url) && !url.match(/embed/) && !url.match(/study/) && !url.match(/blog/)) {
          url = new URL(url.replace("lichess.org/", "lichess.org/embed/"));
          let id;
          try {
            id = url.pathname.split("/").slice(-1)[0];
          } catch (e) {
            id = "";
          }
          url = new URL(url.href.replace(id, id.slice(0, 8)));
          if (id) {
            return (
              <GenericEmbed
                preview={util.crop(props.preview.id, 270, 270)}
                url={url}
                playBtnClass={"lichess"}
              />
            );
          }
        }
      }
      if ("youtube" == props.data["providerName"].toLowerCase()) {
        let url = props.url;
        if (props?.preview?.id && url) {
          url = new URL(url);
          let video_id;
          let playlist_id;
          if (
            url.host == "www.youtube.com"
            || url.host == "m.youtube.com"
            || url.host == "youtube.com"
            || url.host == "music.youtube.com"
          ) {
            if(url.pathname.match(/shorts/)) {
              video_id = [`v=${url.pathname.split("/").slice(-1)[0]}`];
              playlist_id = [];
            } else if(url.pathname.match(/embed/)) {
              video_id = [`v=${url.pathname.split("/").slice(-1)[0]}`];
              playlist_id = [];
            } else {
              video_id = url.search.substring(1).split("&").filter(e => e.match(/^v=/));
              playlist_id = url.search.substring(1).split("&").filter(e => e.match(/^list=/));
            }
          }
          if (url.host == "youtu.be") {
            video_id = [`v=${url.pathname.slice(1)}`];
            playlist_id = [];
          }
          let timecode = router.getParam("t", url.search.substring(1));
          if (playlist_id.length && video_id.length) {
            return (
              <GenericEmbed
                preview={util.crop(props.preview.id, 1024, 270)}
                url={
                  `https://youtube.com/embed/${video_id[0].split("=")[1]}?autoplay=1&controls=2&wmode=opaque&list=${playlist_id[0].split("=")[1]}${timecode ? `&start=${timecode}` : ""}`
                }
                playBtnClass={"youtube"}
              />
            );
          }
          if (playlist_id.length) {
            return (
              <GenericEmbed
                preview={util.crop(props.preview.id, 1024, 270)}
                url={
                  `https://youtube.com/embed/videoseries?list=${playlist_id[0].split("=")[1]}&autoplay=1&controls=2&wmode=opaque${timecode ? `&start=${timecode}` : ""}`
                }
                playBtnClass={"youtube"}
              />
            );
          }
          if (video_id.length) {
            return (
              <GenericEmbed
                preview={util.crop(props.preview.id, 1024, 270)}
                url={
                  `https://youtube.com/embed/${video_id[0].split("=")[1]}?autoplay=1&controls=2&wmode=opaque${timecode ? `&start=${timecode}` : ""}`
                }
                playBtnClass={"youtube"}
              />
            );
          }
        }
      }
      if ("invidious" == props.data["providerName"].toLowerCase()) {
        let url = props?.data?.url && typeof(props?.data.url) == "string" ? props.data?.url : props.url;
        if (props?.preview?.id && url) {
          return (
            <GenericEmbed
              preview={util.crop(props.preview.id, 1024, 270)}
              url={
                `${url.replace("watch?v=", "embed/")}`
              }
              playBtnClass={"youtube"}
            />
          );
        }
      }
    }
    if (props.data["content-type"] == "image/gif") {
      return (
        <div class="container d-flex justify-content-center flex-wrap align-items-center">
          <img
            href={util.toApp(props.url)}
            class="img-fluid"
            data-origin={props.url}
            data-src={props.url}
            src={props.url}
          />
        </div>
      );
    }
    if (/image/.test(props.data["content-type"])) {
      return (
        <div class="container d-flex justify-content-center flex-wrap align-items-center">
          <a
            href={util.toApp(props.url)}
            class="glightbox"
            data-type="image"
            data-srcset={`${util.thumbnail(props.preview.id, 720)} 720w, ${util.thumbnail(props.preview.id, 1366)} 1366w, ${util.thumbnail(props.preview.id, 2048)} 2048w`}
            data-sizes="(max-width: 992px) 720px, (max-width: 1400px) 1366px, 2048px"
            onClick={e => openLightbox(e)}
          >
            <img
              href={util.toApp(props.url)}
              class="img-fluid cursor-pointer"
              data-origin={props.url}
              data-src={util.thumbnail(props.preview.id, 1366)}
              src={util.thumbnail(props.preview.id, 2048)}
            />
          </a>
        </div>
      );
    }
    // application/ogg: https://developer.mozilla.org/en-US/docs/Web/HTTP/Configuring_servers_for_Ogg_media
    if (/video/.test(props.data["content-type"]) || props.data["content-type"] == "application/ogg") {
      return (
        <div class="container d-flex justify-content-center flex-wrap align-items-center">
          <video class="img-fluid" controls src={props.url} />
        </div>
      );
    }
    if (/audio/.test(props.data["content-type"])) {
      return (
        <div class="container d-flex justify-content-center flex-wrap align-items-center">
          <audio class="w-100" controls>
            <source src={props.url} />
          </audio>
        </div>
      );
    }
    if (
      props.data["title"] &&
      (props.preview || props.data["description"])
    ) {
      return (
        <a
          class="preview-card seamless-link d-inline-block"
          target="_blank"
          rel="noreferrer"
          href={util.toApp(props.url)}
        >
          <div class="card" style="max-width: 480px">
            {props.preview && (
              <img
                class="card-img-top"
                src={util.crop(props.preview.id, 320, 180)}
              />
            )}
            <div class="card-body p-1">
              <h5>{props.data["title"]}</h5>
              {props.data["description"] && (
                <p>
                  <small>{props.data["description"].slice(0, 500)}</small>
                </p>
              )}
            </div>
          </div>
        </a>
      );
    }
    return null;
  };

  if (!props.url || !props.data) {
    return null;
  }
  let preview = getPreview();
  if (preview) {
    return <p class="text-center card-text">{preview}</p>;
  }
  return null;
}
