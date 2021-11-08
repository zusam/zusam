import { createStoreon } from 'storeon';
//import { crossTab } from '@storeon/crosstab';

import { meStore } from './me.js';
import { routerStore } from './router.js';
import { notificationsStore } from './notifications.js';

const store = createStoreon([meStore, routerStore, notificationsStore]);
export default store;
