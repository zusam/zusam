import { h, render, Component } from "preact";

export default class GenericEmbed extends Component {
    render() {
        if (this.state.revealed) {
            return (
                <div class="embed-responsive embed-responsive-16by9">
                    <iframe allowfullscreen class="embed-responsive-item" src={this.props.url}>
                    </iframe>
                </div>
            );
        }
        return (
            <div class="embed-preview" onClick={() => this.setState({revealed: true})}>
                <div className={this.props.playBtnClass}></div>
                <img src={this.props.preview}/>
            </div>
        );
    }
}
