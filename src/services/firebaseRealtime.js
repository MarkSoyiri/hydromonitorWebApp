import { ref, onValue, off, set, update, push, remove, get, query, limitToLast, orderByChild, equalTo } from 'firebase/database';
import { database } from './firebase';

export const rtdbRef = (path) => ref(database, path);

export const rtdbOnValue = (path, callback, errorCallback) => {
  const dbRef = rtdbRef(path);
  onValue(dbRef, (snapshot) => {
    callback(snapshot.val());
  }, errorCallback);
  return () => off(dbRef);
};

export const rtdbGet = (path) => get(rtdbRef(path));

export const rtdbSet = (path, data) => set(rtdbRef(path), data);

export const rtdbUpdate = (path, data) => update(rtdbRef(path), data);

export const rtdbPush = (path, data) => push(rtdbRef(path), data);

export const rtdbRemove = (path) => remove(rtdbRef(path));

export const rtdbQuery = (path, constraints) => {
  let dbRef = ref(database, path);
  const queryConstraints = [];
  if (constraints?.orderByChild) queryConstraints.push(orderByChild(constraints.orderByChild));
  if (constraints?.equalTo !== undefined) queryConstraints.push(equalTo(constraints.equalTo));
  if (constraints?.limitToLast) queryConstraints.push(limitToLast(constraints.limitToLast));
  return get(query(dbRef, ...queryConstraints));
};

export const listenToChildAdded = (path, callback) => {
  const dbRef = rtdbRef(path);
  const listener = onValue(dbRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        callback(key, value);
      });
    }
  });
  return () => off(dbRef, 'value', listener);
};

export const rtdbSubscriptions = {};

export const subscribeRealtime = (path, callback, errorCallback) => {
  if (rtdbSubscriptions[path]) {
    rtdbSubscriptions[path]();
  }
  rtdbSubscriptions[path] = rtdbOnValue(path, callback, errorCallback);
  return rtdbSubscriptions[path];
};

export const unsubscribeRealtime = (path) => {
  if (rtdbSubscriptions[path]) {
    rtdbSubscriptions[path]();
    delete rtdbSubscriptions[path];
  }
};
