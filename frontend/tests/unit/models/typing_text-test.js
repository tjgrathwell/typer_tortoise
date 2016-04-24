import { moduleFor, module, test } from 'ember-qunit';
import Utilities from 'frontend/util'

moduleFor('model:typing_text', 'Unit | typing text', {
  unit: true
});

function lines () {
  var arr = [];
  for (var i=0; i < arguments.length; i++) {
    arr.push(arguments[i]);
  }
  return arr.join('\n');
}

function typeOnSnippet (model, str) {
  $.each(str.split(''), function (i, chr) {
    model.typeOn(chr);
  });
}

function validateSnippetProperties (assert, model, prop_hash) {
  var $renderedText = $('<div>' + model.get('renderedText') + '</div>');
  if (prop_hash.hasMistakes) {
    assert.equal($renderedText.find('.has-mistakes').length > 0, prop_hash.hasMistakes);
  }
  if (prop_hash.beforeCursor) {
    assert.equal($renderedText.find('.before-cursor').html(), prop_hash.beforeCursor);
  }
  if (prop_hash.atCursor) {
    assert.equal($renderedText.find('.type-cursor').html(), prop_hash.atCursor);
  }
  if (prop_hash.afterCursor) {
    assert.equal($renderedText.find('.after-cursor').html(), prop_hash.afterCursor);
  }
}

test("guesses the level of indentation for a snippet with 2-space indent", function(assert) {
  const snippetText = lines(
    'this is a fake',
    '  code snippet',
    '  with indentation',
    '    that should be two spaces'
  );

  var snippet = Ember.Object.create({id: 1, fullText: snippetText});
  assert.equal(this.subject({snippet: snippet}).tabSize(), 2);
});

test("guesses the level of indentation for a snippet with 3-space indent", function(assert) {
  const snippetText = lines(
    'this is a crazy',
    '   code snippet',
    '      with three',
    '   line indentation'
  );

  var snippet = Ember.Object.create({id: 1, fullText: snippetText});
  assert.equal(this.subject({snippet: snippet}).tabSize(), 3);
});

test("guesses the level of indentation for a snippet with 4-space indent", function(assert) {
  const snippetText = lines(
    'four spaces',
    '    is an okay number',
    '    for a program',
    '        to have'
  );

  var snippet = Ember.Object.create({id: 1, fullText: snippetText});
  assert.equal(this.subject({snippet: snippet}).tabSize(), 4);
});

test("wraps the areas before, in, and after the cursor in special tags", function(assert) {
  var snippet_text = lines(
    'this snippet has',
    '  more than one line'
  );

  var snippet = Ember.Object.create({id: 1, fullText: snippet_text});
  var text_model = this.subject({snippet: snippet});

  typeOnSnippet(text_model, 'this snippet');

  validateSnippetProperties(assert, text_model, {
    hasMistakes  : false,
    beforeCursor : 'this snippet',
    atCursor     : '&nbsp;',
    afterCursor  : 'has\n  more than one line'
  });

  typeOnSnippet(text_model, 'zz');

  validateSnippetProperties(assert, text_model, {
    hasMistakes  : true,
    beforeCursor : 'this snippet',
    atCursor     : 'zz',
    afterCursor  : 'as\n  more than one line',
  });

  Utilities.repeat(function () { text_model.backUp() }, 2);

  validateSnippetProperties(assert, text_model, {
    hasMistakes  : false,
    beforeCursor : 'this snippet',
    atCursor     : '&nbsp;',
    afterCursor  : 'has\n  more than one line',
  });

  var nine_as = 'aaaaaaaaa';
  typeOnSnippet(text_model, nine_as);

  validateSnippetProperties(assert, text_model, {
    hasMistakes  : true,
    beforeCursor : 'this snippet',
    atCursor     : nine_as,
    afterCursor  : '\n  more than one line',
  });

  Utilities.repeat(function () { text_model.backUp() }, 9);
  typeOnSnippet(text_model, ' has');

  validateSnippetProperties(assert, text_model, {
    hasMistakes  : false,
    beforeCursor : 'this snippet has',
    atCursor     : "\u21b5",
    afterCursor  : '\n  more than one line',
  });

  // typo exactly on the newline character
  typeOnSnippet(text_model, 'Z');

  validateSnippetProperties(assert, text_model, {
    hasMistakes  : true,
    beforeCursor : 'this snippet has',
    atCursor     : 'Z',
    afterCursor  : '\n  more than one line',
  });
});

test("starts the next line at the same indentation level as the previous line", function(assert) {
  var snippet_text = lines(
    'this snippet has',
    '  two lines',
    '  that are indented',
    'and then another that is not'
  );

  var snippet = Ember.Object.create({id: 1, fullText: snippet_text});
  var text_model = this.subject({snippet: snippet});
  typeOnSnippet(text_model, "this snippet has\n");

  validateSnippetProperties(assert, text_model, {
    hasMistakes  : false,
    beforeCursor : 'this snippet has\n',
    atCursor     : '&nbsp;',
    afterCursor  : ' two lines\n  that are indented\nand then another that is not',
  });

  typeOnSnippet(text_model, '  two lines\n');

  validateSnippetProperties(assert, text_model, {
    hasMistakes  : false,
    beforeCursor : 'this snippet has\n  two lines\n  ',
    atCursor     : 't',
    afterCursor  : 'hat are indented\nand then another that is not',
  });

  typeOnSnippet(text_model, 'that are indented\n');

  validateSnippetProperties(assert, text_model, {
    hasMistakes  : true,
    beforeCursor : 'this snippet has\n  two lines\n  that are indented\n',
    atCursor     : '←⎯',
    afterCursor  : 'd then another that is not',
  });

  // when there's multiple tab-widths worth of text, backspace should go back one tab width
  text_model.backUp();

  validateSnippetProperties(assert, text_model, {
    hasMistakes  : false,
    beforeCursor : 'this snippet has\n  two lines\n  that are indented\n',
    atCursor     : 'a',
    afterCursor  : 'nd then another that is not',
  });
});

test("doesn't consider auto-indentation on empty lines as a 'mistake'", function(assert) {
  var snippet_text = lines(
    '  first line indented',
    '', // second line empty
    '  third line indented'
  );

  var snippet = Ember.Object.create({id: 1, fullText: snippet_text});
  var text_model = this.subject({snippet: snippet});
  typeOnSnippet(text_model, "  first line indented\n");

  validateSnippetProperties(assert, text_model, {
    hasMistakes  : false,
    beforeCursor : '  first line indented\n  ',
    atCursor     : "↵",
    afterCursor  : '\n  third line indented',
  });

  typeOnSnippet(text_model, "\n");
  validateSnippetProperties(assert, text_model, {
    hasMistakes  : false,
    beforeCursor : '  first line indented\n  \n  ',
    atCursor     : "t",
    afterCursor  : 'hird line indented',
  });
});

test("escapes snippet text", function (assert) {
  var snippet_text = lines(
    '<div>first</div>',
    '<p>second</p>',
    '<span>third</span>'
  );

  var snippet = Ember.Object.create({id: 1, fullText: snippet_text});
  var text_model = this.subject({snippet: snippet});
  typeOnSnippet(text_model, "<div>first</div>\n");

  validateSnippetProperties(assert, text_model, {
    hasMistakes  : false,
    beforeCursor : '&lt;div&gt;first&lt;/div&gt;\n',
    atCursor     : '&lt;',
    afterCursor  : 'p&gt;second&lt;/p&gt;\n&lt;span&gt;third&lt;/span&gt;',
  });
});

test("backspacing removes one space when the typed whitespace does not match indent level", function (assert) {
  var snippet_text = lines(
    'def foo',
    '  def bar',
    '    a = b + 1',
    '  end',
    'end'
  );

  var snippet = Ember.Object.create({id: 1, fullText: snippet_text, categoryName: 'ruby'});
  var text_model = this.subject({snippet: snippet});

  typeOnSnippet(text_model, "def foo\n  def bar\n "); // note 1 space

  text_model.backUp();

  validateSnippetProperties(assert, text_model, {
    beforeCursor : 'def foo\n  def bar\n  '
  });
});

test("backspacing removes one indent level worth of spaces when the typed whitespace is a multiple of the indent level", function (assert) {
  var snippet_text = lines(
    'def foo',
    '  def bar',
    '    a = b + 1',
    '  end',
    'end'
  );

  var snippet = Ember.Object.create({id: 1, fullText: snippet_text, categoryName: 'ruby'});
  var text_model = this.subject({snippet: snippet});

  typeOnSnippet(text_model, "def foo\n  def bar\n  "); // note 2 spaces

  text_model.backUp();

  validateSnippetProperties(assert, text_model, {
    beforeCursor : 'def foo\n  def bar\n  '
  });
});

test("skips leading comments on snippet initialize", function (assert) {
  var snippet_text = lines(
  '# hello',
  '# this is some stuff',
  'a = b + 1'
  );

  var snippet = Ember.Object.create({id: 1, fullText: snippet_text, categoryName: 'ruby'});
  var text_model = this.subject({snippet: snippet});

  validateSnippetProperties(assert, text_model, {
    hasMistakes  : false,
    beforeCursor : '<span class="comment"># hello</span>\n<span class="comment"># this is some stuff</span>\n',
    atCursor     : 'a',
    afterCursor  : ' = b + 1',
  });
});

test("skips inline comments while typing", function (assert) {
  var snippet_text = lines(
  'a = b + 1 # math',
  'puts a'
  );

  var snippet = Ember.Object.create({id: 1, fullText: snippet_text, categoryName: 'ruby'});
  var text_model = this.subject({snippet: snippet});

  typeOnSnippet(text_model, "a = b + 1");

  validateSnippetProperties(assert, text_model, {
    hasMistakes  : false,
    beforeCursor : 'a = b + 1<span class="comment"> # math</span>\n',
    atCursor     : 'p',
    afterCursor  : 'uts a',
  });
});

test("preserves indent after skipping comments", function (assert) {
  var snippet_text = lines(
  'def foo',
  '  a = 1',
  '  # this adds more',
  '  a += 1',
  'end'
  );

  var snippet = Ember.Object.create({id: 1, fullText: snippet_text, categoryName: 'ruby'});
  var text_model = this.subject({snippet: snippet});
  typeOnSnippet(text_model, "def foo\n  a = 1\n");

  validateSnippetProperties(assert, text_model, {
    hasMistakes  : false,
    beforeCursor : 'def foo\n  a = 1\n<span class="comment">  # this adds more</span>\n  ',
    atCursor     : 'a',
    afterCursor  : ' += 1\nend',
  });
});

test("does not skip comments when the comment character is in a string", function (assert) {
  var snippet_text = lines(
  '"round #{n}"',
  'puts x'
  );

  var snippet = Ember.Object.create({id: 1, fullText: snippet_text, categoryName: 'ruby'});
  var text_model = this.subject({snippet: snippet});
  typeOnSnippet(text_model, '"round ');

  validateSnippetProperties(assert, text_model, {
    hasMistakes  : false,
    beforeCursor : '"round ',
    atCursor     : '#',
    afterCursor  : '{n}"\nputs x',
  });
});

test("does not allow backspacing over skipped comments", function (assert) {
  var snippet_text = lines(
  '# cool code here',
  'a = 2 + 2'
  );

  var snippet = Ember.Object.create({id: 1, fullText: snippet_text, categoryName: 'ruby'});
  var text_model = this.subject({snippet: snippet});
  typeOnSnippet(text_model, 'a');

  validateSnippetProperties(assert, text_model, {beforeCursor : '<span class="comment"># cool code here</span>\na'});

  text_model.backUp();

  validateSnippetProperties(assert, text_model, {beforeCursor : '<span class="comment"># cool code here</span>\n'});

  text_model.backUp();

  validateSnippetProperties(assert, text_model, {beforeCursor: '<span class="comment"># cool code here</span>\n'});
});

test("allows backspacing over the first mistake before a comment", function (assert) {
  var snippet_text = lines(
  'b = 1',
  '# cool code here',
  'a = 2 + 2'
  );

  var snippet = Ember.Object.create({id: 1, fullText: snippet_text, categoryName: 'ruby'});
  var text_model = this.subject({snippet: snippet});
  typeOnSnippet(text_model, 'b = 1zz');

  validateSnippetProperties(assert, text_model, {
    beforeCursor : 'b = 1',
    atCursor: 'zz'
  });

  text_model.backUp();

  validateSnippetProperties(assert, text_model, {
    beforeCursor : 'b = 1',
    atCursor: 'z'
  });

  text_model.backUp();

  validateSnippetProperties(assert, text_model, {
    beforeCursor : 'b = 1',
    atCursor: '↵'
  });
});

test("allows backspacing over the first mistake after a skipped comment", function (assert) {
  var snippet_text = lines(
  '# cool code here',
  'a = 2 + 2'
  );

  var snippet = Ember.Object.create({id: 1, fullText: snippet_text, categoryName: 'ruby'});
  var text_model = this.subject({snippet: snippet});
  typeOnSnippet(text_model, 'b');

  validateSnippetProperties(assert, text_model, {
    beforeCursor : '<span class="comment"># cool code here</span>\n',
    atCursor: 'b'
  });

  text_model.backUp();

  validateSnippetProperties(assert, text_model, {
    beforeCursor : '<span class="comment"># cool code here</span>\n',
    atCursor: 'a'
  });
});

test("adds whitespace to empty lines to meet the expected indentation threshold", function (assert) {
  var snippet_text = lines(
  'this snippet has',
  '  an empty line',
  '', // <= this one!
  '  that will have two spaces on it'
  );

  var snippet = Ember.Object.create({id: 1, fullText: snippet_text});
  var text_model = this.subject({snippet: snippet});
  assert.equal(text_model.get('full_string'), lines(
  'this snippet has',
  '  an empty line',
  '  ',
  '  that will have two spaces on it'
  ));
});

test("removes trailing whitespace", function (assert) {
  var snippet_text = lines(
  'who put the trailing   ',
  '  whitespace in this? '
  );

  var snippet = Ember.Object.create({id: 1, fullText: snippet_text});
  var text_model = this.subject({snippet: snippet});
  assert.equal(text_model.get('full_string'), lines(
  'who put the trailing',
  '  whitespace in this?'
  ));
});
