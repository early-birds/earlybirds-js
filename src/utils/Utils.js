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
}

export const Encode = object => {
    const str = JSON.stringify(object);
    let hash = 0;
    let i;
    let chr;
    let len;
    if (str.length === 0) return hash;
    for (i = 0, len = str.length; i < len; i++) {
      chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return hash;
}