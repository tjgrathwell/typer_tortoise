describe("repeat", function () {
  it("calls a function (first arg) some number (second arg) of times", function () {
    var counter = 1;
    App.util.repeat(function () { counter++ }, 5);

    expect(counter).toEqual(1 + 5);
  });

  it("takes 'this' as an optional third argument", function () {
    var obj = {counter: 3};
    App.util.repeat(function () { this.counter++ }, 4, obj);

    expect(obj.counter).toEqual(3 + 4);
  });
});

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
      '  with indendation',
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

      expect(model._tabSize()).toEqual(indent);
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
    var snippet_text = lines(
      'this snippet has',
      '  more than one line'
    );

    var text_model = App.models.TypingText.create({full_string: snippet_text, snippet_id: 1});

    type_on_snippet(text_model, 'this snippet');

    validate_snippet_properties(text_model, {
      hasMistakes  : false,
      beforeCursor : 'this snippet',
      atCursor     : ' ',
      afterCursor  : 'has\n  more than one line'
    });
    expect(text_model.get('renderedCursor')).toEqual("&nbsp;");

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
      atCursor     : "\n",
      afterCursor  : '\n  more than one line',
    });
    expect(text_model.get('renderedCursor')).toEqual("\u21b5");

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
      atCursor     : "\n",
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
  var catController = App.controllers.CategoryPrefController.create();

  var categories_json = [
    {id: 1, name: 'melodramatically-din',   enabled: false},
    {id: 2, name: 'warrant-individualists', enabled: true},
    {id: 3, name: 'overlaid-arachnids',     enabled: true}
  ];

  catController.set('content', $.map(categories_json, function (el) {
    return App.models.Category.create(el);
  }))

  it('allows you to ask for just the enabled categories', function () {
    expect(catController.enabledCategoryIds()).toEqual([2, 3]);
  });

  it('allows you to toggle categories on and off', function () {
    catController.setCategory(2, false);
    expect(catController.enabledCategoryIds()).toEqual([3]);
  });

  it('whines when you try to toggle a category it does not know', function () {
    expect(function () {
      catController.setCategory(4, false);
    }).toThrow(new Error("Couldn't find an object with id 4"));
  });
});

describe("category preferences for a user that hasn't logged in", function () {
  var storage_key_name = 'typer_tortoise.category_ids';

  var categories_json = [
    {id: 1, name: 'melodramatically-din',   enabled: false},
    {id: 2, name: 'warrant-individualists', enabled: true},
    {id: 3, name: 'overlaid-arachnids',     enabled: true}
  ];

  beforeEach(function () {
    App.user = null;
    App.storage.clear();
  });

  it('loads the selected categories from localstorage if available', function () {
    var catController = App.controllers.CategoryPrefController.create();

    spyOn(catController, '_loadCategoriesFromServer').andCallFake(function (cb) {
      cb(categories_json);
    });

    expect(catController.enabledCategoryIds()).toEqual([]);

    App.storage.set(storage_key_name, '1,3');
    catController.loadCategories();

    expect(catController.enabledCategoryIds()).toEqual([1,3]);
  });

  it('saves the selected categories into localstorage as csv', function () {
    var catController = App.controllers.CategoryPrefController.create();

    catController.set('content', $.map(categories_json, function (el) {
      return App.models.Category.create(el);
    }))

    catController.saveCategories(function () {});

    expect(App.storage.get(storage_key_name)).toEqual('2,3');
  });

  it('optimistically creates category objects from localStorage on init', function () {
    App.storage.set(storage_key_name, '35,93');

    var catController = App.controllers.CategoryPrefController.create();
    expect(catController.enabledCategoryIds()).toEqual([35, 93]);
  });
});