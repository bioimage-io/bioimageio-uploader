import {writable} from 'svelte/store';

function persist(key: string, value: unknown) {
    console.debug(`Persisting value of ${key}`);
    console.debug(value);
    sessionStorage.setItem(key, JSON.stringify(value));
}

export function writableSession(key: string, initialValue: string) {
  const sessionValue = JSON.parse(sessionStorage.getItem(key) || "null");
  if (!sessionValue) persist(key, initialValue);

  const store = writable(sessionValue || initialValue);
  store.subscribe(value => persist(key, value));
  return store;
}
