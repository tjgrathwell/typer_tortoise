var App = Em.Application.create();

//
//  utilities
//

jQuery.fn.centerOnParent = function () {
  var parent = this.parent();
  var parent_offset = parent.offset();
  this.css({
    top:  parent_offset.top  + ((parent.height() / 2) - (this.height() / 2)),
    left: parent_offset.left + ((parent.width()  / 2) - (this.width()  / 2))
  });
  return this;
}

App.util = {};
App.util.chomp = function (raw_text) {
  return raw_text.replace(/\r/g, '').replace(/\n+$/, '');
};

//
//  history handling
//

App.history = Em.Object.create({
  pageToken:    function ()      { return window.location.pathname; },
  setPageToken: function (token) { return history.pushState({}, '', token); }
});

//
//  models
//

App.Score = Em.Object.extend({
  wpm: null,
  accuracy: null,
  snippet_id: null
});

App.TypingText = Em.Object.extend({
  full_string: null,
  snippet_id: null,

  mistakes: [],
  total_mistakes: 0,
  cursor_pos: 0,

  _tab_size: null,

  start_time: null,
  wpm_timer_id: null,
  wpm_ticks: null,

  finished: false,

  _tabSize: function () {
    if (this._tab_size) {
      return this._tab_size;
    }

    var indents = [];

    var lines = this.full_string.split('\n');
    $.each(lines, function (i, line) {
      var match = line.match('^(\\s+)');
      if (match) {
        indents.push(match[1].length);
      }
    });

    this._tab_size = indents[0];
    return this._tab_size;
  },

  //
  // rendering bookkeeping
  //
  hasMistakes: function () {
    return (this.mistakes.length > 0);
  }.property('mistakes.length'),

  beforeCursor: function () {
    return this.full_string.substr(0, this.cursor_pos);
  }.property('cursor_pos'),

  atCursor: function () {
    if (this.mistakes.length > 0) {
      return this.mistakes.join('');
    }

    var this_char = this.full_string.substr(this.cursor_pos, 1);
    if (this_char === '\n') {
      // show the "return key" symbol instead of just the (invisible) newline char
      return "\u21b5";
    }

    return this_char;
  }.property('cursor_pos', 'mistakes.length'),

  afterCursor: function () {
    var adjustedCursor;

    // For mistakes to not clobber the newline character (which causes
    //   an unpleasant visual effect) we need to make sure to preserve
    //   any \n between (cursor_pos) and (cursor_pos + mistakes.length)
    var clobberedArea = this.full_string.substr(this.cursor_pos, this.mistakes.length);
    if (clobberedArea.indexOf('\n') >= 0) {
      adjustedCursor = this.cursor_pos + clobberedArea.indexOf('\n');
    } else {
      adjustedCursor = this.cursor_pos + this.mistakes.length;
    }

    var this_char = this.full_string.substr(this.cursor_pos, 1);
    if (this.mistakes.length === 0 && this_char !== '\n') {
      // If we have no mistakes, one character is reserved for the 'atCursor' point.
      // EXCEPT if that character is a newline: the newline always comes in the
      //   afterCursor section, so we leave the cursor alone.
      adjustedCursor += 1;
    }
    return this.full_string.substr(adjustedCursor);
  }.property('cursor_pos', 'mistakes.length'),

  //
  // synthesized typing quality data
  //
  wpm: function () {
    if (this.start_time === null) { return 0; }

    var now = (new Date()).getTime();
    var minutes = (now - this.start_time) / (1000 * 60);

    if (minutes < 0.05) {
      return 0;
    }

    var wpm_raw = (this.cursor_pos / 5.0) / minutes;

    return wpm_raw.toFixed();
  }.property('wpm_ticks'),

  accuracy: function () {
    if (this.cursor_pos === 0) {
      return 100;
    }

    if (this.cursor_pos < this.total_mistakes) {
      return 0;
    }

    var raw_acc = (this.cursor_pos - this.total_mistakes) / this.cursor_pos;
    return (raw_acc * 100).toFixed(0);
  }.property('cursor_pos', 'total_mistakes'),

  //
  // user actions
  //
  typeOn: function (chr) {
    if (this.finished) {
      return;
    }

    if (this.start_time === null) {
      this.set('start_time', (new Date()).getTime());

      var self = this;
      var timer_id = window.setInterval(function () {
        self.set('wpm_ticks', self.wpm_ticks + 1);
      }, 250);
      this.set('wpm_timer_id', timer_id);
    }

    var cursor_matches = this.full_string.substr(this.get('cursor_pos'), 1) == chr;
    var no_mistakes = this.mistakes.length == 0;
    if (no_mistakes && cursor_matches) {
      this.set('cursor_pos', this.cursor_pos + 1);
    } else {
      this.set('total_mistakes', this.total_mistakes + 1);
      if (chr === ' ') {
        this.mistakes.pushObject('&nbsp;');
      } else {
        this.mistakes.pushObject(chr);
      }
    }

    if (this.cursor_pos === this.full_string.length) {
      this.set('finished', true);
      window.clearInterval(this.wpm_timer_id);
    }
  },

  tabPressed: function () {
    for (var i = 0; i < this._tabSize(); i++) {
      this.typeOn(' ');
    }
  },

  backUp: function () {
    if (this.finished) {
      return;
    }

    if (this.cursor_pos === 0 && this.mistakes.length === 0) {
      return;
    }

    if (this.mistakes.length > 0) {
      this.mistakes.popObject();
    } else {
      this.set('cursor_pos', this.cursor_pos - 1);
    }
  },

  //
  // output
  //
  getScore: function () {
    // TODO returning an actual Score model here causes infinite recursion.
    // Bit of a bummer.
    return {
      snippet_id: this.snippet_id,
      wpm: this.get('wpm'),
      accuracy: this.get('accuracy')
    };
  }
});

//
//  views
//

App.WPMDisplay = Em.View.extend({
  tagName: 'span',
  classNames: ['stat-counter'],

  textBinding: 'App.typingAreaController.current_snippet'
});

App.AccuracyDisplay = Em.View.extend({
  tagName: 'span',
  classNames: ['stat-counter'],

  textBinding: 'App.typingAreaController.current_snippet'
});

App.FocusNag = Em.View.extend({
  classNameBindings: ['focusNagClass', 'isFocused:hidden'],
  focusNagClass: 'focus-nag',

  isFocusedBinding: 'parentView.focused',

  centerOnTypingArea: function () {
    if (this.$().length === 0) { return; }
    this.$().centerOnParent();
  },

  focusChanged: function () {
    if (!this.get('isFocused')) {
      this.centerOnTypingArea();
    }
  }.observes('isFocused')
});

App.TypingArea = Em.View.extend({
  textBinding: 'App.typingAreaController.current_snippet',
  typeCursorClass: 'type-cursor',

  focused: false,

  keyDown: function (e) {
    App.setPreventDefaultForKey(e);
    if (e.which == App.KEY_BACKSPACE) {
      this.text.backUp();
    }
    if (e.which == App.KEY_TAB) {
      this.text.tabPressed();
    }
  },

  keyPress: function (e) { // keyDown doesn't account for shift key
    App.setPreventDefaultForKey(e);
    if (App.notAKeypress(e)) {
      return;
    }

    var chr = String.fromCharCode(e.which);

    // normalize newlines
    if (chr === '\r') { chr = '\n'; }

    this.text.typeOn(chr);
  },

  snippetChanged: function () {
    this.$().find('.type-panel').focus();
  }.observes('text'),

  focusIn:  function (e) { this.set('focused', true);  },
  focusOut: function (e) { this.set('focused', false); }
});

App.typingAreaController = Em.Object.create({
  current_snippet: null,

  finishedObserver: function () {
    if (this.current_snippet.finished) {
      if (App.history.pageToken().match('/play')) {
        // reset the URL from pointing at a specific snippet (/snippets/15/play)
        // to the root URL (/) to indicate "random play mode" has resumed
        App.history.setPageToken('/');
      }
      this.saveScore();
      this.newSnippet();
    }
  }.observes('current_snippet.finished'),

  saveScore: function () {
    App.scoresController.add(this.current_snippet.getScore());
    $.post('/scores', {score: this.current_snippet.getScore()});
  },

  changeSnippetToCategory: function (category_ids) {
    if (category_ids.indexOf(this.current_snippet.category_id) >= 0) {
      return;
    }

    this.newSnippet();
  },

  newSnippet: function (snippet_num) {
    var self = this;

    var url = '/snippets/random.json';
    if (snippet_num) {
      url = '/snippets/' + snippet_num + '.json';
    }

    var params = {};
    if (this.current_snippet) {
      params['last_seen'] = this.current_snippet.snippet_id;
    }

    $.get(url, params, function (snippet_json) {
      self.set('current_snippet', App.TypingText.create({
        full_string: App.util.chomp(snippet_json['full_text']),
        snippet_id: snippet_json['id'],
        category_id: snippet_json['category_id']
      }));
    });
  },
});

App.scoresController = Em.ArrayController.create({
  content: [],

  loadScores: function (score) {
    var self = this;
    $.get('/scores/', function (json) {
      self.set('content', json);
    });
  },

  add: function (score) {
    this.pushObject(score);
  }
});

App.ScoreListView = Em.View.extend({});

//
//  category preferences stuff
//

App.prefsLink = Em.View.extend({
  tagName: 'span',
  classNames: ['prefs-link'],

  click: function () {
    App.categoryPrefController.showPreferences();
  }
});

App.prefsSaveButton = Em.Button.extend({
  click: function (e) {
    App.categoryPrefController.saveCategories();
  }
});

App.prefsPopup = Em.View.extend({
  templateName: 'prefs-popup',
  classNames: ['prefs-popup-bg'],

  click: function () {
    this.destroy();
  }
});

App.prefsPopupContent = Em.View.extend({
  classNames: ['blue-round', 'prefs-popup'],

  click: function (e) {
    e.stopPropagation();
  },

  didInsertElement: function () {
    this._super();
    this.$().css({
      left: $('.container').position().left + 40,
      top: $(window).height() / 4
    });
  },
});

App.categoryPrefController = Em.ArrayController.create({
  content: [],
  prefs_popup: null,

  showPreferences: function () {
    var self = this;
    this.loadCategories(function () {
      var popup_view = App.prefsPopup.create({});
      self.set('prefs_popup', popup_view);
      popup_view.appendTo('.container');
    });
  },

  saveCategories: function () {
    var self = this;
    var selected_categories = this.prefs_popup.$().find('input:checked').map(function () {
      return parseInt($(this).attr('value'), 10); }
    ).toArray();
    $.post('/categories', {categories: selected_categories}, function () {
      self.get('prefs_popup').destroy();
      self.set('prefs_popup', null);
      App.typingAreaController.changeSnippetToCategory(selected_categories);
    });
  },

  loadCategories: function (finished_cb) {
    var self = this;
    $.get('/categories', function (json) {
      self.set('content', json);
      finished_cb();
    });
  }
});

//
//  key handling
//

// some reference for character codes:
//   var chr_from_int = String.fromCharCode(34);
//   var int_from_chr = '"'.charCodeAt(0)

App.KEY_BACKSPACE     = 8;
App.KEY_TAB           = 9;
App.KEY_RETURN        = 13;
App.KEY_SINGLE_QUOTE  = 39;
App.KEY_FORWARD_SLASH = 47;

App.notAKeypress = function (e) {
  // Pressing 'ctrl-t' to open a new tab still sends that 't'
  //   to the typing area before the new tab opens, meaning
  //   you can unintentionally start 'typing' when you're
  //   really going away to do something else.
  // Don't accept any keystrokes with modifiers to avoid
  //   all these sort of problems.
  if (e.ctrlKey || e.altKey || e.metaKey) { return true; }

  if (e.which == App.KEY_BACKSPACE) { return true; }
  // tab in keypress shows as 0
  if (e.which == 0)                 { return true; }
  return false;
};

App.setPreventDefaultForKey = function (e) {
  // in firefox delete/backspace goes back a page. undesirable!
  if (e.which == App.KEY_BACKSPACE)       { e.preventDefault();   }

  // in firefox, single quote and forward slash do a "quick search"
  if (e.which == App.KEY_SINGLE_QUOTE)    { e.preventDefault();   }
  if (e.which == App.KEY_FORWARD_SLASH)   { e.preventDefault();   }

  // tab shouldn't take us out of the typing window
  if (e.which == App.KEY_TAB)             { e.preventDefault();   }
};

//
//  entry point
//

if (App.history.pageToken() === '/' || App.history.pageToken().match('/play') ) {
  $(document).bind('keyPress keyDown', function (e) {
    App.setPreventDefaultForKey(e);
  });

  var path = App.history.pageToken();
  if (path.match('/play')) {
    var snippet_num = path.match('/snippets/(\\d+)/play')[1];
    App.typingAreaController.newSnippet(snippet_num);
  } else {
    App.typingAreaController.newSnippet();
  }

  App.scoresController.loadScores();
}
