var App = Em.Application.create();

//
//  jQuery addons
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

//
//  utilities
//

App.util = {};

App.util.chomp = function (raw_text) {
  return raw_text.replace(/\r/g, '').replace(/\n+$/, '');
};

App.util.leadingWhitespaceCount = function (str) {
  return str.match(/^(\s*)/)[1].length;
};

App.util.trailingWhitespaceCount = function (str) {
  return str.match(/(\s*)$/)[1].length;
};

App.util.repeat = function (func, times, this_val) {
  if (this_val) {
    func = func.bind(this_val);
  }
  for (var i = 0; i < times; i++) {
    func();
  }
};

//
//  local storage
//

App.storage = {
  supported: function () {
    try {
      localStorage.setItem('foo', 'bar');
      localStorage.removeItem('foo');
      return true;
    } catch(e) {
      return false;
    }
  }(),

  get: function (key) {
    return localStorage[key];
  },

  set: function (key, val) {
    localStorage[key] = val;
  },

  clear: function () {
    localStorage.clear();
  },

  remove: function (key) {
    localStorage.removeItem(key);
  }
};

//
//  currently logged in user
//

App.user = null;

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

App.Category = Em.Object.extend({
  id: null,
  name: null,
  enabled: null,

  toJson: function () {
    return {id: this.get('id')};
  }
});

App.Score = Em.Object.extend({
  wpm: null,
  accuracy: null,
  snippet_id: null
});

App.TypingText = Em.Object.extend({
  full_string: null,
  snippet_id: null,
  category_id: null,

  init: function() {
    this._super();
    this.set('mistakes', []);

    this.set('total_mistakes', 0);
    this.set('cursor_pos', 0);

    this.set('start_time', null);
    this.set('wpm_timer_id', null);
    this.set('wpm_ticks', null);

    this.set('finished', false);

    this._normalizeSnippet();
    this.set('_tab_size', this._tabSize());
  },

  _normalizeSnippet: function () {
    var raw_lines = this.get('full_string').split('\n');

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
      prev_line_indent = App.util.leadingWhitespaceCount(line);
    });

    this.set('full_string', normalized.join('\n'));
  },

  _tabSize: function () {
    var indents = [];

    // guess the indent size to be however deeply indented the first indented line is
    var lines = this.full_string.split('\n');
    lines.forEach(function (line) {
      var match = line.match('^(\\s+)');
      if (match) {
        indents.push(match[1].length);
      }
    });

    return indents[0];
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
    return this_char;
  }.property('cursor_pos', 'mistakes.length'),

  renderedCursor: function () {
    var cursorStr = this.get('atCursor');
    return cursorStr.split('').map(function (chr) {
      if (chr === '\n') {
        // show the "return key" symbol instead of just the (invisible) newline char
        return "\u21b5";
      }
      if (chr === ' ') {
        return "&nbsp;";
      }
      return chr;
    }).join('');
  }.property('atCursor'),

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

  _startWpmTimer: function () {
    this.set('start_time', (new Date()).getTime());

    var timer_id = window.setInterval((function () {
      this.set('wpm_ticks', this.wpm_ticks + 1);
    }).bind(this), 250);

    this.set('wpm_timer_id', timer_id);
  },

  _stopWpmTimer: function () {
    this.set('finished', true);
    window.clearInterval(this.wpm_timer_id);
  },

  _previousLineIndent: function () {
    var lines = this.get('beforeCursor').split('\n');
    if (lines.length < 2) return;

    var prev_line = lines[lines.length - 2];
    return App.util.leadingWhitespaceCount(prev_line);
  },

  _autoIndent: function () {
    var spaces = this._previousLineIndent();
    App.util.repeat(function () { this.typeOn(' ') }, spaces, this);
  },

  //
  // user actions
  //
  typeOn: function (chr) {
    if (this.finished) return;

    // start the wpm timer if this is the first character typed
    if (this.start_time === null) this._startWpmTimer();

    var cursor_matches = this.full_string.substr(this.get('cursor_pos'), 1) == chr;
    var no_mistakes = this.mistakes.length == 0;
    if (no_mistakes && cursor_matches) {
      this.set('cursor_pos', this.cursor_pos + 1);
      if (chr === '\n') {
        this._autoIndent();
      }
    } else {
      this.set('total_mistakes', this.total_mistakes + 1);
      this.mistakes.pushObject(chr);
    }
    
    // clear the wpm timer if the snippet is finished
    if (this.cursor_pos === this.full_string.length) this._stopWpmTimer();
  },

  tabPressed: function () {
    App.util.repeat(function () { this.typeOn(' ') }, this.get('_tab_size'), this);
  },

  backUp: function () {
    if (this.finished) return;

    if (this.cursor_pos === 0 && this.mistakes.length === 0) return;

    var lines = (this.get('beforeCursor') + this.get('atCursor')).split('\n');
    var current_line = lines[lines.length-1];
    // if there's at least one tab worth of trailing whitespace on this line,
    //   'tab' backwards
    if (App.util.trailingWhitespaceCount(current_line) >= this.get('_tab_size')) {
      App.util.repeat(function () { this._backUp() }, this.get('_tab_size'), this);
    } else {
      this._backUp();
    }
  },

  _backUp: function () {
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
  classNames: 'type-area-container',
  textBinding: 'App.typingAreaController.current_snippet',

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
    this.$().fadeIn('slow');
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
    if (!App.isPlaying()) return;

    if (category_ids.indexOf(this.current_snippet.category_id) >= 0) {
      // if this snippet is already in the whitelist of categories, nothing to do
      return;
    }

    this.newSnippet();
  },

  newSnippet: function (snippet_num) {
    var params = {};

    var url;
    if (snippet_num) {
      url = '/snippets/' + snippet_num + '.json';
    } else {
      url = '/snippets/random.json';
      if (!App.user) {
        params['category_ids'] = App.categoryPrefController.enabledCategoryIds();
      }
    }

    if (this.current_snippet) {
      params['last_seen'] = this.current_snippet.snippet_id;
    }

    $.get(url, params, (function (snippet_json) {
      this.set('current_snippet', App.TypingText.create({
        full_string: App.util.chomp(snippet_json['full_text']),
        snippet_id: snippet_json['id'],
        category_id: snippet_json['category_id']
      }));
    }).bind(this));
  },
});

App.scoresController = Em.ArrayController.create({
  content: [],

  loadScores: function (score) {
    $.get('/scores/', (function (json) {
      this.set('content', json);
    }).bind(this));
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
  templateName: 'prefs-link',
  tagName: 'span',
  classNames: ['prefs-link'],

  click: function () {
    App.categoryPrefController.showPreferences();
  }
});

App.prefsSaveButton = Em.Button.extend({
  click: function (e) {
    var pref_controller = App.categoryPrefController;
    pref_controller.saveCategories(function () {
      pref_controller.hidePreferences();
      App.typingAreaController.changeSnippetToCategory(pref_controller.enabledCategoryIds());
    });
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
      left: $('.container').offset().left + 40,
      top: $(window).height() / 4
    });
  },
});

App.CategoryPrefController = Em.ArrayController.extend({
  content: [],
  prefs_popup: null,

  init: function () {
    // if category ids are in local storage, optimistically
    //   load them into 'content' (as just ids, no 'name' attribute)
    //   as if we know they're correct.
    //
    // this is to optimize the initial pageload so we don't have
    //   to load /categories before /snippets/random.
    //
    // hopefully any discontinuities (a user with discontinued
    //   categories in their localStorage prefs) will be cleared
    //   up when that user next saves their prefs.
    if (!App.user && App.storage.supported) {
      var category_ids = App.storage.get('typer_tortoise.category_ids');
      if (category_ids) {
        var categories = category_ids.split(',').map(function (cat_id) {
          return App.Category.create({id: parseInt(cat_id, 10), enabled: true});
        });
        this.set('content', categories);
      }
    }
  },

  findCategoryById: function (category_id) {
    var content = this.get('content');
    var length = content.length;
    for (var i = 0; i < length; i++) {
      if (content[i].get('id') === category_id) {
        return content[i];
      }
    }
    throw "Couldn't find an object with id " + category_id;
  },

  setCategory: function (category_id, enabled) {
    this.findCategoryById(category_id).set('enabled', enabled);
  },

  disableAll: function () {
    this.get('content').forEach(function (category) { 
      category.set('enabled', false)
    });
  },

  enabledCategories: function () {
    return this.get('content').filter(function (el) { return el.enabled });
  },

  enabledCategoryIds: function () {
    return this.enabledCategories().map(function (cat) { return cat.get('id') });
  },

  saveCategories: function (finished_cb) {
    if (App.user) {
      this._saveCategoriesToServer(finished_cb);
    } else {
      this._saveCategoriesToStorage(finished_cb);
    }
  },

  _saveCategoriesToServer: function (finished_cb) {
    $.post('/categories', {categories: this.enabledCategoryIds()}, finished_cb);
  },

  _saveCategoriesToStorage: function (finished_cb) {
    if (!App.storage.supported) return;

    App.storage.set('typer_tortoise.category_ids', this.enabledCategoryIds().join(',')); 
    finished_cb();
  },

  loadCategories: function (finished_cb) {
    this._loadCategoriesFromServer((function (json) {
      this.set('content', json.map(function (el) { return App.Category.create(el); }));
      if (!App.user) {
        this._loadCategoryPreferencesFromStorage();
      }
      if (finished_cb) finished_cb();
    }).bind(this));
  },

  _loadCategoriesFromServer: function (success_cb) {
    $.get('/categories', success_cb);
  },

  _loadCategoryPreferencesFromStorage: function () {
    if (!App.storage.supported) return;
    
    var category_id_csv = App.storage.get('typer_tortoise.category_ids');
    if (!category_id_csv) return;

    this.disableAll();

    var category_ids = category_id_csv.split(',').map(function (id) { return parseInt(id, 10) });
    category_ids.forEach(function (cat_id) {
      this.setCategory(cat_id, true);
    }, this);
  },

  showPreferences: function () {
    this.loadCategories(this._showPopup.bind(this));
  },

  _showPopup: function () {
    var popup_view = App.prefsPopup.create({});
    this.set('prefs_popup', popup_view);
    popup_view.appendTo('.container');
  },

  hidePreferences: function () {
    this.get('prefs_popup').destroy();
    this.set('prefs_popup', null);
  }
});

App.categoryPrefController = App.CategoryPrefController.create({});

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

App.isPlaying = function () {
  return (App.history.pageToken() === '/') || App.history.pageToken().match('/play');
};

App.start = function () {
  if (App.user && App.storage.supported) {
    // Kill localStorage prefs every time someone logs in properly.
    App.storage.remove('typer_tortoise.category_ids');
  }

  var prefs_link = App.prefsLink.create({});
  prefs_link.replaceIn('#prefs-link-container');

  if (!App.isPlaying()) return;

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
