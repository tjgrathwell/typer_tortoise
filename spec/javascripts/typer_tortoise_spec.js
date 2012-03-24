describe("indentation guessing", function() {
  it("should be able to guess the level of indentation", function() {
    var two = "this is a fake\n  code snippet\n  with indendation\n    that should be two spaces";
    var three = "this is a crazy\n   code snippet\n      with three\n   line indentation";
    var four = "four spaces\n    is an okay number\n    for a program\n        to have";

    var two_text = App.TypingText.create({full_string: two, snippet_id: 1});
    var three_text = App.TypingText.create({full_string: three, snippet_id: 1});
    var four_text = App.TypingText.create({full_string: four, snippet_id: 1});

    expect(two_text._tabSize()).toEqual(2);
    expect(three_text._tabSize()).toEqual(3);
    expect(four_text._tabSize()).toEqual(4);
  });
});

describe("snippet whitespace normalization", function () {
  it("adds whitespace to empty lines to meet the expected indentation threshold", function () {
    var snippet_text = [
      'this snippet has',
      '  an empty line',
      '', // <= this one!
      '  that will have two spaces on it',
    ].join('\n');

    var text_model = App.TypingText.create({full_string: snippet_text, snippet_id: 1});
    expect(text_model.get('full_string')).toEqual(
      'this snippet has\n  an empty line\n  \n  that will have two spaces on it'
    );
  });

  it("removes trailing whitespace", function () {
    var snippet_text = [
      'who put the trailing   ',
      '  whitespace in this? ',
    ].join('\n');

    var text_model = App.TypingText.create({full_string: snippet_text, snippet_id: 1});
    expect(text_model.get('full_string')).toEqual('who put the trailing\n  whitespace in this?');
  });
});

describe("typing on a snippet", function() {

  var type_on_snippet = function (model, str) {
    $.each(str.split(''), function (i, chr) {
      model.typeOn(chr);
    });
  }
  var repeat = function (func, times) {
    for (var i = 0; i < times; i++) {
      func();
    }
  }

  var validate_snippet_properties = function (model, prop_hash) {
    expect(model.get('hasMistakes' )).toEqual(prop_hash.hasMistakes);
    expect(model.get('beforeCursor')).toEqual(prop_hash.beforeCursor);
    expect(model.get('atCursor')    ).toEqual(prop_hash.atCursor);
    expect(model.get('afterCursor' )).toEqual(prop_hash.afterCursor);
  }

  it("splits the snippet into many parts for the view to render", function() {
    var snippet_text = [
      'this snippet has',
      '  more than one line'
    ].join('\n');

    var text_model = App.TypingText.create({full_string: snippet_text, snippet_id: 1});

    type_on_snippet(text_model, 'this snippet');

    validate_snippet_properties(text_model, {
      hasMistakes  : false,
      beforeCursor : 'this snippet',
      atCursor     : ' ',
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
      atCursor     : ' ',
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
    var snippet_text = [
      'this snippet has',
      '  two lines',
      '  that are indented',
      'and then another that is not'
    ].join('\n');
    
    var text_model = App.TypingText.create({full_string: snippet_text, snippet_id: 1});
    type_on_snippet(text_model, "this snippet has\n");

    validate_snippet_properties(text_model, {
      hasMistakes  : false,
      beforeCursor : 'this snippet has\n',
      atCursor     : ' ',
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
      atCursor     : '  ',
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
    var snippet_text = [
      '  first line indented',
      '', // second line empty
      '  third line indented',
    ].join('\n');
    
    var text_model = App.TypingText.create({full_string: snippet_text, snippet_id: 1});
    type_on_snippet(text_model, "  first line indented\n");

    validate_snippet_properties(text_model, {
      hasMistakes  : false,
      beforeCursor : '  first line indented\n  ',
      atCursor     : "\u21b5",
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
});

describe("category preferences controller", function () {
  var enabledCategoryIds = function () {
    return $.map(App.categoryPrefController.enabledCategories(), function (el) {
      return el.id 
    });
  };

  var categories_json = [
    {id: 1, name: 'melodramatically-din',   enabled: false},
    {id: 2, name: 'warrant-individualists', enabled: true},
    {id: 3, name: 'overlaid-arachnids',     enabled: true}
  ];
  App.categoryPrefController.set('content', $.map(categories_json, function (el) {
    return App.Category.create(el);
  }))

  it('allows you to ask for just the enabled categories', function () {
    expect(enabledCategoryIds()).toEqual([2, 3]);
  });

  it('allows you to toggle categories on and off', function () {
    App.categoryPrefController.setCategory(2, false);
    expect(enabledCategoryIds()).toEqual([3]);
  });

  it('whines when you try to toggle a category it does not know', function () {
    expect(function () {
      App.categoryPrefController.setCategory(4, false);
    }).toThrow(new Error("Couldn't find an object with id 4"));
  });
});