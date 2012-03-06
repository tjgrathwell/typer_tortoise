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

describe("typing on a snippet", function() {

  var type_on_snippet = function (model, str) {
    $.each(str.split(''), function (i, chr) {
      model.typeOn(chr);
    });
  }
  var backspace = function (model, times) {
    for (var i = 0; i < times; i++) {
      model.backUp();
    }
  }

  it("splits the snippet into many parts for the view to render", function() {
    var snippet_text = [
      'this snippet has',
      '  more than one line'
    ].join('\n');

    var text_model = App.TypingText.create({full_string: snippet_text, snippet_id: 1});

    type_on_snippet(text_model, 'this snippet');

    expect(text_model.get('hasMistakes' )).toEqual(false);
    expect(text_model.get('beforeCursor')).toEqual('this snippet');
    expect(text_model.get('atCursor')    ).toEqual(' ');
    expect(text_model.get('afterCursor' )).toEqual('has\n  more than one line');

    type_on_snippet(text_model, 'zz');

    expect(text_model.get('hasMistakes' )).toEqual(true);
    expect(text_model.get('beforeCursor')).toEqual('this snippet');
    expect(text_model.get('atCursor'    )).toEqual('zz');
    expect(text_model.get('afterCursor' )).toEqual('as\n  more than one line');

    backspace(text_model, 2);

    expect(text_model.get('hasMistakes' )).toEqual(false);
    expect(text_model.get('beforeCursor')).toEqual('this snippet');
    expect(text_model.get('atCursor'    )).toEqual(' ');
    expect(text_model.get('afterCursor' )).toEqual('has\n  more than one line');

    var nine_as = 'aaaaaaaaa';
    type_on_snippet(text_model, nine_as);

    expect(text_model.get('hasMistakes' )).toEqual(true);
    expect(text_model.get('beforeCursor')).toEqual('this snippet');
    expect(text_model.get('atCursor'    )).toEqual(nine_as);
    expect(text_model.get('afterCursor')).toEqual('\n  more than one line');

    backspace(text_model, 9);
    type_on_snippet(text_model, ' has');
    
    expect(text_model.get('hasMistakes' )).toEqual(false);
    expect(text_model.get('beforeCursor')).toEqual('this snippet has');
    expect(text_model.get('atCursor'    )).toEqual("\u21b5");
    expect(text_model.get('afterCursor' )).toEqual('\n  more than one line');

    // typo exactly on the newline character
    type_on_snippet(text_model, 'Z');

    expect(text_model.get('hasMistakes' )).toEqual(true);
    expect(text_model.get('beforeCursor')).toEqual('this snippet has');
    expect(text_model.get('atCursor'    )).toEqual("Z");
    expect(text_model.get('afterCursor' )).toEqual('\n  more than one line');
  });
});

describe("category preferences controller", function () {
  var enabledCategoryIds = function () {
    return $.map(App.categoryPrefController.enabledCategories(), function (el) {
      return el.id 
    });
  }

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