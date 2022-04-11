import { h } from "preact";

export default function InstagramEmbed(props) {
  return (
    <a
      class="preview-card seamless-link d-inline-block"
      target="_blank"
      rel="noreferrer"
      href={props.url}
    >
      <div class="card" style="max-width: 480px">
        {props.preview && (
          <img
            class="card-img-top"
            src={props.preview}
          />
        )}
        <div class="card-body p-1">
          <h5>{props.title}</h5>
          {props.description && (
            <p>
              <small>{props.description.slice(0, 1000)}</small>
            </p>
          )}
        </div>
      </div>
    </a>
  );
}
