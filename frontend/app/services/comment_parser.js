export default {
  canParseComments: function (categoryName) {
    var commentableCategories = ['ruby', 'javascript', 'python', 'c', 'perl', 'php'];
    return commentableCategories.indexOf(categoryName) !== -1;
  },

  computeCommentRanges: function (categoryName, fullString) {
    var highlighted = hljs.highlight(categoryName, fullString).value;
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
        while (fullString[indexIncludingWhitespace - 1] === ' ') {
          indexIncludingWhitespace = indexIncludingWhitespace - 1;
        }
        commentRanges.push([indexIncludingWhitespace, index + textLength]);
      }
      index += textLength;
    });
    return commentRanges;
  }
};
