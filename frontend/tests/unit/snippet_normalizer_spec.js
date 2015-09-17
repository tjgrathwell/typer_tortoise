function lines () {
  var arr = [];
  for (var i=0; i < arguments.length; i++) {
    arr.push(arguments[i]);
  }
  return arr.join('\n');
}

describe("snippet whitespace normalization", function () {
  it("adds whitespace to empty lines to meet the expected indentation threshold", function () {
    var snippet_text = lines(
    'this snippet has',
    '  an empty line',
    '', // <= this one!
    '  that will have two spaces on it'
    );

    var text_model = App.models.TypingText.create({full_string: snippet_text, snippet_id: 1});
    expect(text_model.get('full_string')).toEqual(lines(
    'this snippet has',
    '  an empty line',
    '  ',
    '  that will have two spaces on it'
    ));
  });

  it("removes trailing whitespace", function () {
    var snippet_text = lines(
    'who put the trailing   ',
    '  whitespace in this? '
    );

    var text_model = App.models.TypingText.create({full_string: snippet_text, snippet_id: 1});
    expect(text_model.get('full_string')).toEqual(lines(
    'who put the trailing',
    '  whitespace in this?'
    ));
  });
});
