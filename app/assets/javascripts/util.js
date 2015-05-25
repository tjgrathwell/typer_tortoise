App.util = {};

App.util.chomp = function (raw_text) {
  return raw_text.replace(/\r/g, '').replace(/\n+$/, '');
};

App.util.leadingWhitespaceCount = function (str) {
  return str.match(/^(\s*)/)[1].length;
};

App.util.trailingWhitespaceCount = function (str) {
  return str.match(/(\s*)$/)[1].length;
};

App.util.repeat = function (func, times, this_val) {
  if (this_val) {
    func = func.bind(this_val);
  }
  for (var i = 0; i < times; i++) {
    func();
  }
};