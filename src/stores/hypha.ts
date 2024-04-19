import { writable } from "svelte/store";
import { writableSession } from "./store_util";

export const token = writableSession("hypha_token", null);
export const login_url = writable<string>(null);
export const connection_tries = writable<number>(0);
