import { readable, writable } from 'svelte/store';

export const files = writeable([]);
export const rdf = writeable({});
export const rdf_url = writeable({}); 
export const status_url = writeable({}); 

export const api = readable({});
export const storage = readable({});
export const storage_info = readable({});
