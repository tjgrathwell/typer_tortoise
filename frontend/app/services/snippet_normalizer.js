import Utilities from 'frontend/util';

export default {
  normalizeSnippet: function (full_string) {
    var raw_lines = full_string.split('\n');

    var prev_line_indent = 0;
    var normalized = [];
    raw_lines.forEach(function (line) {
      if (line.match(/^\s*$/)) {
        // force empty normalized to have as much whitespace as the previous line is indented
        normalized.push(new Array(prev_line_indent + 1).join(' '));
      } else {
        // delete trailing whitespace on non-empty lines
        normalized.push(line.replace(/\s+$/, ''));
      }
      prev_line_indent = Utilities.leadingWhitespaceCount(line);
    });

    return normalized.join('\n');
  }
}
