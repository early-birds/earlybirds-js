export const isEqual = (obj1, obj2) => {
  for (var i in obj1) {
    if (obj1.hasOwnProperty(i)) {
      if (!obj2.hasOwnProperty(i)) return false;
      if (obj1[i] != obj2[i]) return false;
    }
  }
  for (var i in obj2) {
    if (obj2.hasOwnProperty(i)) {
      if (!obj1.hasOwnProperty(i)) return false;
      if (obj1[i] != obj2[i]) return false;
    }
  }
  return true;
};

export const Encode = (object) => {
  const str = JSON.stringify(object);
  let hash = 0;
  let i;
  let chr;
  let len;
  if (str.length === 0) return hash;
  for (i = 0, len = str.length; i < len; i += 1) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash;
};

export const getNavigatorSegments = () => {
  const segments = {
    navigator_appCodeName: window.navigator.appCodeName,
    navigator_appName: window.navigator.appName,
    navigator_appVersion: window.navigator.appVersion,
    navigator_cookieEnabled: window.navigator.cookieEnabled,
    navigator_doNotTrack: window.navigator.doNotTrack,
    navigator_language: window.navigator.language,
    navigator_platform: window.navigator.platform,
    navigator_product: window.navigator.product,
    navigator_productSub: window.navigator.productSub,
    navigator_userAgent: window.navigator.userAgent,
    navigator_vendor: window.navigator.vendor,
    navigator_vendorSub: window.navigator.vendorSub,
  };

  try {
    window.localStorage.setItem('testeb', 'testeb');
    window.localStorage.removeItem('testeb');
    segments.navigator_localStorageEnabled = true;
  } catch (e) {
    segments.navigator_localStorageEnabled = false;
  }

  if (window.screen.width && window.screen.height) {
    segments.screen_resolution = `${window.screen.width}x${window.screen.height}`;
  }

  return segments;
};
