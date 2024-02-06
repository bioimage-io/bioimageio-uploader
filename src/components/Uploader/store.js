import { readable, writable } from 'svelte/store';
import Uploader from './index.js';

//export const files = writeable([]);
//export const rdf = writeable({});
//export const rdf_url = writeable({}); 
//export const status_url = writeable({}); 

//export const api = readable({});
//export const storage = readable({});
//export const storage_info = readable({});
//
export const uploader = readable(new Uploader());
