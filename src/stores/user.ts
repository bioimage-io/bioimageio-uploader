import { writable } from "svelte/store";
import UserInfo from "../lib/user_info";

export interface UserState{
    is_reviewer: boolean;
    is_logged_in: boolean;
    user_info?: UserInfo; 
}


const user = writable<UserState>({
  is_logged_in: false,
  is_reviewer: false,
});

export default user; 
