import { createStoreon } from 'storeon';
//import { crossTab } from '@storeon/crosstab';

import { meStore } from './me.js';
import { routerStore } from './router.js';

const store = createStoreon([meStore, routerStore]);
export default store;
