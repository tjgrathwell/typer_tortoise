import Utilities from 'frontend/util';

export default {
  normalizeSnippet: function (fullString) {
    var rawLines = fullString.split('\n');

    var prevLineIndent = 0;
    var normalized = [];
    rawLines.forEach(function (line) {
      if (line.match(/^\s*$/)) {
        // force empty normalized to have as much whitespace as the previous line is indented
        normalized.push(new Array(prevLineIndent + 1).join(' '));
      } else {
        // delete trailing whitespace on non-empty lines
        normalized.push(line.replace(/\s+$/, ''));
      }
      prevLineIndent = Utilities.leadingWhitespaceCount(line);
    });

    return normalized.join('\n');
  }
}
