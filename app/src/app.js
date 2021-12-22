import { h } from "preact";
import { api, me, lang, notifications } from "/src/core";
import {
  Login,
  Public,
  ResetPassword,
  Signup,
  StopNotificationEmails
} from "/src/outside";
import { MessageParent } from "/src/message";
import { GroupWriter } from "/src/writer";
import { CreateGroup, GroupBoard, Share, BookmarkBoard } from "/src/pages";
import { SettingsWrapper } from "/src/settings";
import { GroupSearchWrapper } from "/src/navbar";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useEffect } from "preact/hooks";

function App() {

  const navigate = useNavigate();
  const location = useLocation();

  // initial load
  useEffect(() => {
    api.update();
    notifications.update();
    me.fetch().then(user => {
      if (user) {
        if (location.pathname == "/") {
          let redirect = "/create-group";
          if (user.data?.default_group) {
            redirect = `/groups/${user?.data["default_group"]}`;
          } else if (user?.groups[0]) {
            redirect = `/groups/${user?.groups[0].id}`;
          }
          navigate(redirect);
        }
      } else if (location.pathname == "/" || location.pathname == "") {
        navigate("/login");
      } else if (location.pathname == "/logout") {
        me.logout();
      }
    });

    // i18n dict management
    lang.init();
    window.addEventListener("fetchedNewDict", () => {
      // lang is loaded (force refresh)
      // setTimeout(() => this.setState({lang: "up"}), 10);
    });

    // manage dropdowns
    window.addEventListener("click", e => {
      if (!e.target.closest(".dropdown")) {
        // close dropdowns if we are clicking on something else
          document.querySelectorAll(".dropdown").forEach(n => n.classList.remove("active"));
      } else {
        // close dropdowns that are not clicked on
        document
          .querySelectorAll(".dropdown")
          .forEach(n => {
            if(n != e.target.closest(".dropdown")) {
              n.classList.remove("active")
            }
          });
      }
    });
  }, []);

  // check if user is connected
  // storage.get("apiKey").then(apiKey => {
  //   if (router.route == "invitation") {
  //     if (apiKey) {
  //       http.post(`/api/groups/invitation/${router.id}`, {}).then(() => {
  //         this.props.history.push("/");
  //       });
  //     } else {
  //       this.props.history.push(`/signup?inviteKey=${router.id}`);
  //     }
  //   } else if (!router.isOutside() && !apiKey) {
  //     // redirect to login if we don't have an apiKey
  //     this.props.history.push("/login");
  //   }
  // });

  return (
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/stop-notification-emails" element={<StopNotificationEmails />} />
      <Route path="/public/:token" element={<Public />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/login" element={<Login />} />
      <Route path="/:type/:id/settings" element={<SettingsWrapper />} />
      <Route path="/create-group" element={<CreateGroup />} />
      <Route path="/share" element={<Share />} />
      <Route path="/messages/:id" element={<MessageParent />} />
      <Route path="/messages/:id/:child_id" element={<MessageParent />} />
      <Route path="/bookmarks" element={<BookmarkBoard />} />
      <Route path="/groups/:id/write" element={<GroupWriter />} />
      <Route path="/groups/:id" element={<GroupBoard />} />
      <Route path="/groups/:id/search" element={<GroupSearchWrapper />} />
    </Routes>
  );
}

export default App;
