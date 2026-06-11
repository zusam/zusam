import { h } from "preact";
import { useNavigate } from "react-router-dom";

// useNavigate is a hook and can't be called in class components:
// this injects it as a "navigate" prop instead.
// https://reactrouter.com/en/6.30.1/start/faq#what-happened-to-withrouter-i-need-it
export default function withNavigate(Component) {
  return function WithNavigate(props) {
    const navigate = useNavigate();
    return <Component {...props} navigate={navigate} />;
  };
}
