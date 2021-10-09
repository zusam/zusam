import { h, Component } from "preact";
import { util } from "/src/core";
import BandCampEmbed from "./embeds/bandcamp-embed.component.js";
import GenericEmbed from "./embeds/generic-embed.component.js";

export default class EmbedBlock extends Component {
  getPreview() {
    if (this.props?.data?.exception) {
      console.warn(this.props.data);
    }
    if (this.props.data["providerName"]) {
      if ("peertube" == this.props.data["providerName"].toLowerCase()) {
          // default embed code
          if (this.props.data["code"]) {
            return (
              <div class="embed-container" dangerouslySetInnerHTML={{ __html: this.props.data["code"] }} />
            );
          }
      }
      if ("soundcloud" == this.props.data["providerName"].toLowerCase()) {
          if (this.props.data["code"]) {
            return (
              <GenericEmbed
                preview={util.crop(this.props.preview.id, 1024, 270)}
                url={
                  `${this.props.data["code"].match(/https:\/\/[^"\s]+/)[0] 
                  }&auto_play=true`
                }
                playBtnClass={"soundcloud"}
              />
            );
          }
      }
      if ("bandcamp" == this.props.data["providerName"].toLowerCase()) {
        if (this.props.data["code"]) {
          let id = this.props.data["code"].match(/https:\/\/.*album=\d+/);
          if (!id) {
            id = this.props.data["code"].match(/https:\/\/.*track=\d+/);
          }
          if (id) {
            return (
              <BandCampEmbed
              preview={util.crop(this.props.preview.id, 1024, 270)}
              url={id[0]}
              />
            );
          }
        }
      }
      if ("lichess.org" == this.props.data["providerName"].toLowerCase()) {
        let url = this.props.url;
        if (url.match("/study/")) {
          url = url.replace("/study/", "/study/embed/");
        } else {
          url = url.replace("lichess.org/", "lichess.org/embed/");
        }
        let id;
        try {
          id = url.split("/").slice(-1)[0];
        } catch (e) {
          id = "";
        }
        url = url.replace(id, id.slice(0, 8));
        return (
          <GenericEmbed
            preview={util.crop(this.props.preview.id, 270, 270)}
            url={url}
            playBtnClass={"lichess"}
          />
        );
      }
      if ("youtube" == this.props.data["providerName"].toLowerCase()) {
        return (
          <GenericEmbed
            preview={util.crop(this.props.preview.id, 1024, 270)}
            url={
              `${this.props.data["url"].match(/https:\/\/[^"\s]+/)[0] 
              }&autoplay=1&controls=2&wmode=opaque`
            }
            playBtnClass={"youtube"}
          />
        );
      }
    }
    if (/image/.test(this.props.data["content-type"])) {
      return (
        <div class="container d-flex justify-content-center flex-wrap align-items-center">
          <img
            data-nlg={!this.props.inWriter}
            href={util.toApp(this.props.url)}
            class="img-fluid cursor-pointer"
            data-origin={this.props.url}
            data-src={
              this.props.preview && !/gif/.test(this.props.data["content-type"])
                ? util.thumbnail(this.props.preview.id, 1366, 768)
                : this.props.url
            }
            src={
              this.props.preview && !/gif/.test(this.props.data["content-type"])
                ? util.thumbnail(this.props.preview.id, 1366, 99999)
                : this.props.url
            }
          />
        </div>
      );
    }
    if (/video/.test(this.props.data["content-type"])) {
      return (
        <div class="container d-flex justify-content-center flex-wrap align-items-center">
          <video class="img-fluid" controls src={this.props.url} />
        </div>
      );
    }
    if (/audio/.test(this.props.data["content-type"])) {
      return (
        <div class="container d-flex justify-content-center flex-wrap align-items-center">
          <audio class="w-100" controls>
            <source src={this.props.url} />
          </audio>
        </div>
      );
    }
    if (
      this.props.data["title"] &&
      (this.props.preview || this.props.data["description"])
    ) {
      return (
        <a
          class="preview-card seamless-link d-inline-block"
          target="_blank"
          rel="noreferrer"
          href={util.toApp(this.props.url)}
        >
          <div class="card" style="max-width: 480px">
            {this.props.preview && (
              <img
                class="card-img-top"
                src={util.crop(this.props.preview.id, 320, 180)}
              />
            )}
            <div class="card-body p-1">
              <h5>{this.props.data["title"]}</h5>
              {this.props.data["description"] && (
                <p>
                  <small>{this.props.data["description"].slice(0, 500)}</small>
                </p>
              )}
            </div>
          </div>
        </a>
      );
    }
    return null;
  }

  render() {
    if (!this.props.url || !this.props.data) {
      return null;
    }
    let preview = this.getPreview();
    if (preview) {
      return <p class="text-center card-text">{preview}</p>;
    }
    return null;
  }
}
