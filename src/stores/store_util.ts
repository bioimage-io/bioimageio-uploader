import {writable} from 'svelte/store';

function persist(key: string, value: unknown) {
    sessionStorage.setItem(key, JSON.stringify(value));
}

export function writableSession(key: string, initialValue: string|null) {
  let sessionValue=null;
  try{
    sessionValue = JSON.parse(sessionStorage.getItem(key) || "null");
  }catch(err){
    console.error(`Failed to load session storage for ${key}`);
  }
  if (!sessionValue) persist(key, initialValue);

  const store = writable(sessionValue || initialValue);
  store.subscribe(value => persist(key, value));
  return store;
}
