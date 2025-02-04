import { h, Fragment } from "preact";
import { FaIcon } from "/src/misc";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";


export default function GroupsDropdownWrite(props) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (props.groups.length === 1) {
      navigate(`/groups/${props.groups[0].id}/write`);
    } else {
      e.currentTarget.classList.toggle("active");
    }
  };

  return (
    <Fragment>
      {props.groups && (
        <div
          class="nav-link dropdown groups unselectable feed-write-container"
          onClick={handleClick}
        >
          <div class="unselectable pr-1 write-button material-shadow seamless-link">
            <FaIcon family={"solid"} icon={"pencil-alt"} />
          </div>
          <div class="dropdown-menu dropdown-left z-index-100 feed-write-menu">
            {props.groups.filter(e => !!e).map(e => (
              <Link
                key={e.id}
                to={`/groups/${e.id}/write`}
                class="d-block seamless-link unselectable"
              >
                {e.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </Fragment>
  );
}
