import { writable } from "svelte/store";

const user = writable<{
  is_logged_in: boolean;
  user_info?: any; 
}>({
  is_logged_in: false,
});

export default {
  subscribe: user.subscribe,
  set: user.set,
};
