const Utilities = {};

Utilities.chomp = function (raw_text) {
  return raw_text.replace(/\r/g, '').replace(/\n+$/, '');
};

Utilities.leadingWhitespaceCount = function (str) {
  return str.match(/^(\s*)/)[1].length;
};

Utilities.trailingWhitespaceCount = function (str) {
  return str.match(/(\s*)$/)[1].length;
};

Utilities.repeat = function (func, times, this_val) {
  if (this_val) {
    func = func.bind(this_val);
  }
  for (var i = 0; i < times; i++) {
    func();
  }
};

export default Utilities
