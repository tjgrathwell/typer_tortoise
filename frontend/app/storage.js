export default {
  supported: function () {
    try {
      localStorage.setItem('foo', 'bar');
      localStorage.removeItem('foo');
      return true;
    } catch (e) {
      return false;
    }
  }(),

  get: function (key) {
    return localStorage[key];
  },

  set: function (key, val) {
    localStorage[key] = val;
  },

  clear: function () {
    localStorage.clear();
  },

  remove: function (key) {
    localStorage.removeItem(key);
  }
};
