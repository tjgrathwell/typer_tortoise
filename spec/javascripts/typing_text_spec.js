function lines () {
  var arr = [];
  for (var i=0; i < arguments.length; i++) {
    arr.push(arguments[i]);
  }
  return arr.join('\n');
}

describe("indentation guessing", function() {
  it("should be able to guess the level of indentation", function() {
    var expectations = [];

    expectations.push([2, lines(
      'this is a fake',
      '  code snippet',
      '  with indentation',
      '    that should be two spaces'
    )]);
    expectations.push([3, lines(
      'this is a crazy',
      '   code snippet',
      '      with three',
      '   line indentation'
    )]);
    expectations.push([4, lines(
      'four spaces',
      '    is an okay number',
      '    for a program',
      '        to have'
    )]);

    expectations.forEach(function (testitem) {
      var indent  = testitem[0];
      var snippet = testitem[1];

      var model = App.models.TypingText.create({full_string: snippet, snippet_id: 1});

      expect(model.tabSize()).toEqual(indent);
    });
  });
});

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

describe("typing on a snippet", function() {

  var type_on_snippet = function (model, str) {
    $.each(str.split(''), function (i, chr) {
      model.typeOn(chr);
    });
  };
  var repeat = function (func, times) {
    for (var i = 0; i < times; i++) {
      func();
    }
  };

  var validate_snippet_properties = function (model, prop_hash) {
    var $renderedText = $('<div>' + model.get('renderedText') + '</div>');
    expect($renderedText.find('.has-mistakes').length > 0).toEqual(prop_hash.hasMistakes);
    expect($renderedText.find('.before-cursor').html()).toEqual(prop_hash.beforeCursor);
    expect($renderedText.find('.type-cursor').html()).toEqual(prop_hash.atCursor);
    expect($renderedText.find('.after-cursor').html()).toEqual(prop_hash.afterCursor);
  };

  it("splits the snippet into many parts for the view to render", function() {
    var snippet_text = lines(
      'this snippet has',
      '  more than one line'
    );

    var text_model = App.models.TypingText.create({full_string: snippet_text, snippet_id: 1});

    type_on_snippet(text_model, 'this snippet');

    validate_snippet_properties(text_model, {
      hasMistakes  : false,
      beforeCursor : 'this snippet',
      atCursor     : '&nbsp;',
      afterCursor  : 'has\n  more than one line'
    });

    type_on_snippet(text_model, 'zz');

    validate_snippet_properties(text_model, {
      hasMistakes  : true,
      beforeCursor : 'this snippet',
      atCursor     : 'zz',
      afterCursor  : 'as\n  more than one line',
    });

    repeat(function () { text_model.backUp() }, 2);

    validate_snippet_properties(text_model, {
      hasMistakes  : false,
      beforeCursor : 'this snippet',
      atCursor     : '&nbsp;',
      afterCursor  : 'has\n  more than one line',
    });

    var nine_as = 'aaaaaaaaa';
    type_on_snippet(text_model, nine_as);

    validate_snippet_properties(text_model, {
      hasMistakes  : true,
      beforeCursor : 'this snippet',
      atCursor     : nine_as,
      afterCursor  : '\n  more than one line',
    });

    repeat(function () { text_model.backUp() }, 9);
    type_on_snippet(text_model, ' has');
    
    validate_snippet_properties(text_model, {
      hasMistakes  : false,
      beforeCursor : 'this snippet has',
      atCursor     : "\u21b5",
      afterCursor  : '\n  more than one line',
    });

    // typo exactly on the newline character
    type_on_snippet(text_model, 'Z');

    validate_snippet_properties(text_model, {
      hasMistakes  : true,
      beforeCursor : 'this snippet has',
      atCursor     : 'Z',
      afterCursor  : '\n  more than one line',
    });
  });

  it("starts the next line at the same indentation level as the previous line", function() {
    var snippet_text = lines(
      'this snippet has',
      '  two lines',
      '  that are indented',
      'and then another that is not'
    );
    
    var text_model = App.models.TypingText.create({full_string: snippet_text, snippet_id: 1});
    type_on_snippet(text_model, "this snippet has\n");

    validate_snippet_properties(text_model, {
      hasMistakes  : false,
      beforeCursor : 'this snippet has\n',
      atCursor     : '&nbsp;',
      afterCursor  : ' two lines\n  that are indented\nand then another that is not',
    });

    type_on_snippet(text_model, '  two lines\n');

    validate_snippet_properties(text_model, {
      hasMistakes  : false,
      beforeCursor : 'this snippet has\n  two lines\n  ',
      atCursor     : 't',
      afterCursor  : 'hat are indented\nand then another that is not',
    });

    type_on_snippet(text_model, 'that are indented\n');

    validate_snippet_properties(text_model, {
      hasMistakes  : true,
      beforeCursor : 'this snippet has\n  two lines\n  that are indented\n',
      atCursor     : '&nbsp;&nbsp;',
      afterCursor  : 'd then another that is not',
    });

    // when there's multiple tab-widths worth of text, backspace should go back one tab width
    text_model.backUp();

    validate_snippet_properties(text_model, {
      hasMistakes  : false,
      beforeCursor : 'this snippet has\n  two lines\n  that are indented\n',
      atCursor     : 'a',
      afterCursor  : 'nd then another that is not',
    });
  });

  it("doesn't consider auto-indentation on empty lines as a 'mistake'", function() {
    var snippet_text = lines(
      '  first line indented',
      '', // second line empty
      '  third line indented'
    );
    
    var text_model = App.models.TypingText.create({full_string: snippet_text, snippet_id: 1});
    type_on_snippet(text_model, "  first line indented\n");

    validate_snippet_properties(text_model, {
      hasMistakes  : false,
      beforeCursor : '  first line indented\n  ',
      atCursor     : "↵",
      afterCursor  : '\n  third line indented',
    });

    type_on_snippet(text_model, "\n");
    validate_snippet_properties(text_model, {
      hasMistakes  : false,
      beforeCursor : '  first line indented\n  \n  ',
      atCursor     : "t",
      afterCursor  : 'hird line indented',
    });
  });

  it("escapes snippet text", function () {
    var snippet_text = lines(
      '<div>first</div>',
      '<p>second</p>',
      '<span>third</span>'
    );

    var text_model = App.models.TypingText.create({full_string: snippet_text, snippet_id: 1});
    type_on_snippet(text_model, "<div>first</div>\n");

    validate_snippet_properties(text_model, {
      hasMistakes  : false,
      beforeCursor : '&lt;div&gt;first&lt;/div&gt;\n',
      atCursor     : '&lt;',
      afterCursor  : 'p&gt;second&lt;/p&gt;\n&lt;span&gt;third&lt;/span&gt;',
    });
  });

  describe("skipping comments", function () {
    it("skips leading comments on snippet initialize", function () {
      var snippet_text = lines(
      '# hello',
      '# this is some stuff',
      'a = b + 1'
      );

      var text_model = App.models.TypingText.create({full_string: snippet_text, snippet_id: 1, category_name: 'ruby'});

      validate_snippet_properties(text_model, {
        hasMistakes  : false,
        beforeCursor : '# hello\n# this is some stuff\n',
        atCursor     : 'a',
        afterCursor  : ' = b + 1',
      });
    });

    it("skips inline comments while typing", function () {
      var snippet_text = lines(
      'a = b + 1 # math',
      'puts a'
      );

      var text_model = App.models.TypingText.create({full_string: snippet_text, snippet_id: 1, category_name: 'ruby'});

      type_on_snippet(text_model, "a = b + 1");

      validate_snippet_properties(text_model, {
        hasMistakes  : false,
        beforeCursor : 'a = b + 1 # math\n',
        atCursor     : 'p',
        afterCursor  : 'uts a',
      });
    });

    it("preserves indent after skipping comments", function () {
      var snippet_text = lines(
      'def foo',
      '  a = 1',
      '  # this adds more',
      '  a += 1',
      'end'
      );

      var text_model = App.models.TypingText.create({full_string: snippet_text, snippet_id: 1, category_name: 'ruby'});
      type_on_snippet(text_model, "def foo\n  a = 1\n");

      validate_snippet_properties(text_model, {
        hasMistakes  : false,
        beforeCursor : 'def foo\n  a = 1\n  # this adds more\n  ',
        atCursor     : 'a',
        afterCursor  : ' += 1\nend',
      });
    });

    it("does not auto-indent when the comment character is in a string", function () {
      var snippet_text = lines(
      '"round #{n}"',
      'puts x'
      );

      var text_model = App.models.TypingText.create({full_string: snippet_text, snippet_id: 1, category_name: 'ruby'});
      type_on_snippet(text_model, '"round ');

      validate_snippet_properties(text_model, {
        hasMistakes  : false,
        beforeCursor : '"round ',
        atCursor     : '#',
        afterCursor  : '{n}"\nputs x',
      });
    });
  });
});
