import { writable } from "svelte/store";
import { writableSession } from "./store_util";

export const token = writableSession("hypha_token", "");
export const login_url = writable<string>(undefined);
export const connection_tries = writable<number>(0);
export const hypha_version = writable<string>(undefined);
