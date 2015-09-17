export default {
  canParseComments: function (category_name) {
    var commentableCategories = ['ruby', 'javascript', 'python', 'c', 'perl', 'php'];
    return commentableCategories.indexOf(category_name) !== -1;
  },

  computeCommentRanges: function (category_name, full_string) {
    var highlighted = hljs.highlight(category_name, full_string).value;
    var $highlighted = $('<div>' + highlighted + '</div>');
    var TEXT_NODE = 3;
    var index = 0;
    var commentRanges = [];
    $highlighted.contents().each(function (ix, node) {
      if (node.nodeType === TEXT_NODE) {
        index += node.length;
        return;
      }
      var textLength = node.textContent.length;
      if (node.classList.contains('hljs-comment')) {
        var indexIncludingWhitespace = index;
        while (full_string[indexIncludingWhitespace - 1] === ' ') {
          indexIncludingWhitespace = indexIncludingWhitespace - 1;
        }
        commentRanges.push([indexIncludingWhitespace, index + textLength]);
      }
      index += textLength;
    });
    return commentRanges;
  }
};
