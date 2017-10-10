/*
class Cookies {

  static retrieveCookie(name) {
    const nameEQ = `${name}=`;
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
      }
  }

  static getCookie(name) {
    const retrievedCookie = this.retrieveCookie(name)
    let data;
    try {
        data = JSON.parse(retrievedCookie);
    } catch (e) {
        return retrievedCookie;
    }
    return data;
  }

  static setCookie(name, value, days) {
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = `; expires=${date.toUTCString()}`;
    }
    document.cookie = `${name}=${value}${expires}; path=/`;
  }
}
*/
function Cookies() {}
Cookies.retrieveCookie = function(name) {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
}
Cookies.getCookie = function(name) {
  const retrievedCookie = this.retrieveCookie(name)
  let data;
  try {
    data = JSON.parse(retrievedCookie);
  } catch (e) {
    return retrievedCookie;
  }
  return data;
}
Cookies.setCookie = function(name, value, days) {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = `; expires=${date.toUTCString()}`;
  }
  document.cookie = `${name}=${value}${expires}; path=/`;
}
module.exports = Cookies;
