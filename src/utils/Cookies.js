function Cookies() {}

Cookies.retrieveCookie = function retrieveCookie(name) {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i += 1) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

Cookies.getCookie = function getCookie(name) {
  try {
    return JSON.parse(this.retrieveCookie(name));
  } catch (e) {
    return this.retrieveCookie(name);
  }
};

Cookies.setCookie = function setCookie(name, value, days) {
  let expires = '';
  if (days !== null) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = `${date.toUTCString()}`;
  }
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
};

export default Cookies;
