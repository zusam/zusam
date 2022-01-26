import { createStoreon } from "storeon";
//import { crossTab } from '@storeon/crosstab';

import { meStore } from "./me.js";
import { apiStore } from "./api.js";
import { routerStore } from "./router.js";
import { notificationsStore } from "./notifications.js";

const store = createStoreon([apiStore, meStore, routerStore, notificationsStore]);
export default store;
