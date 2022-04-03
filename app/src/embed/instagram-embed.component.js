import { h, Component } from "preact";

export default class InstagramEmbed extends Component {
  render() {
    return (
      <a
        class="preview-card seamless-link d-inline-block"
        target="_blank"
        rel="noreferrer"
        href={this.props.url}
      >
        <div class="card" style="max-width: 480px">
          {this.props.preview && (
            <img
              class="card-img-top"
              src={this.props.preview}
            />
          )}
          <div class="card-body p-1">
            <h5>{this.props.title}</h5>
            {this.props.description && (
              <p>
                <small>{this.props.description.slice(0, 1000)}</small>
              </p>
            )}
          </div>
        </div>
      </a>
    );
  }
}
