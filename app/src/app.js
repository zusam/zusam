import { h } from "preact";
import { http, api, me, notifications, bookmarks, router } from "/src/core";
import {
  Login,
  Public,
  PasswordReset,
  Signup,
  StopNotificationEmails
} from "/src/outside";
import { MessageParent } from "/src/message";
import { GroupWriter } from "/src/writer";
import { CreateGroup, GroupBoard, Share, BookmarkBoard } from "/src/pages";
import { Settings } from "/src/settings";
import { GroupSearchWrapper } from "/src/navbar";
import {
  Navigate,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useEffect } from "preact/hooks";

function App() {

  const navigate = useNavigate();
  const location = useLocation();

  const toggleDropdowns = e => {
    if (!e.target.closest(".dropdown")) {
      // close dropdowns if we are clicking on something else
      document.querySelectorAll(".dropdown").forEach(n => n.classList.remove("active"));
    } else {
      // close dropdowns that are not clicked on
      document
        .querySelectorAll(".dropdown")
        .forEach(n => {
          if(n != e.target.closest(".dropdown")) {
            n.classList.remove("active");
          }
        });
    }
  };

  // initial load
  useEffect(() => {
    api.update();
    notifications.update();
    bookmarks.update();

    // manage dropdowns
    window.addEventListener("click", e => toggleDropdowns(e));
    return () => {
      window.removeEventListener("click", e => toggleDropdowns(e));
    };
  });

  me.fetch().then(user => {
    if (location.pathname == "/") {
      let redirect = "/login";
      if (user) {
        redirect = "/create-group";
        if (user.data?.default_group) {
          redirect = `/groups/${user?.data["default_group"]}`;
        } else if (user?.groups[0]) {
          redirect = `/groups/${user?.groups[0].id}`;
        }
      }
      navigate(redirect);
    }

    if (location.pathname.match(/^\/invitation/)) {
      if (user) {
        http.post(`/api/groups/invitation/${router.id}`, {}).then(() => {
          navigate("/");
        });
      } else {
        navigate(`/signup?inviteKey=${router.id}`);
      }
    }

    if (!router.isOutside() && !user) {
      navigate("/login");
    }
  });

  return (
    <Routes>
      <Route path="/password-reset" element={<PasswordReset />} />
      <Route path="/public/:token" element={<Public />} />
      <Route path="/share" element={<Share />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/stop-notification-emails" element={<StopNotificationEmails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<Navigate replace to="/login" />} />
      <Route path="/:type/:id/settings" element={<Settings />} />
      <Route path="/bookmarks" element={<BookmarkBoard />} />
      <Route path="/create-group" element={<CreateGroup />} />
      <Route path="/groups/:id" element={<GroupBoard />} />
      <Route path="/groups/:id/search" element={<GroupSearchWrapper />} />
      <Route path="/groups/:id/write" element={<GroupWriter />} />
      <Route path="/messages/:id" element={<MessageParent />} />
      <Route path="/messages/:id/:child_id" element={<MessageParent />} />
    </Routes>
  );
}

export default App;
