import { h, render } from "preact";
import App from "./app.js";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import { StoreContext } from "storeon/preact";
import store from "/src/store";

const router = createBrowserRouter(
  [
    { path: "*", Component: App },
  ],
  {
    basename: `/${document.baseURI.split("/")[3]}`,
  }
);

function Index() {
  return (
    <StoreContext.Provider value={store}>
      <RouterProvider router={router} />
    </StoreContext.Provider>
  );
}

render(<Index />, document.body);
