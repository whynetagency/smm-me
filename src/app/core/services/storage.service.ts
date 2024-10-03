import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor() {}

  set(name: string, value: object | string) {
    localStorage.setItem(name, JSON.stringify(value));
  }

  get(name: string) {
    return JSON.parse(localStorage.getItem(name));
  }

  delete(name: string) {
    localStorage.removeItem(name);
  }

  clear() {
    localStorage.clear();
  }
}
