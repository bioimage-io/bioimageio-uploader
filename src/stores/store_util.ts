import {writable} from 'svelte/store';

function persist(key: string, value: unknown) {
    console.debug(`Persisting value of ${key}`);
    console.debug(value);
    sessionStorage.setItem(key, JSON.stringify(value));
}

export function writableSession(key: string, initialValue: string) {
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
