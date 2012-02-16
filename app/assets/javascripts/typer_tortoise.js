var App = Em.Application.create();

App.util = {};
App.util.chomp = function (raw_text) {
  return raw_text.replace(/(\n|\r)+$/, '');
};

App.TypingText = Ember.Object.extend({
  full_string: null,
  mistakes: [],
  total_mistakes: 0,
  cursor_pos: 0,

  start_time: null,
  wpm_timer_id: null,
  wpm_ticks: null,

  className: 'type-panel',
  focusNagClass: 'focus-nag',

  focused: false,
  finished: false,

  // 
  // rendering bookkeeping
  //
  beforeCursor: function () {
    return this.full_string.substr(0, this.cursor_pos);
  }.property('cursor_pos'),

  atCursor: function () {
    if (this.mistakes.length > 0) {
      return '';
    }

    var this_char = this.full_string.substr(this.cursor_pos, 1);
    if (this_char === '\n') {
      return " [RET]" + this_char;
    } else {
      return this_char;
    }
  }.property('cursor_pos', 'mistakes.length'),

  afterCursor: function () {
    var adjustedCursor = this.cursor_pos + this.mistakes.length;
    return this.full_string.substr(adjustedCursor + 1);
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
    this.typeOn(' ');
    this.typeOn(' ');
    this.typeOn(' ');
    this.typeOn(' ');
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
  }
});

App.WPMDisplay = Em.View.extend({
  tagName: 'span',

  textBinding: 'App.typingAreaController.current_snippet'
});

App.AccuracyDisplay = Em.View.extend({
  tagName: 'span',

  textBinding: 'App.typingAreaController.current_snippet'
});

App.KEY_BACKSPACE     = 8;
App.KEY_TAB           = 9;
App.KEY_RETURN        = 13;
App.KEY_SINGLE_QUOTE  = 39;
App.KEY_FORWARD_SLASH = 47;

App.TypingArea = Em.View.extend({
  textBinding: 'App.typingAreaController.current_snippet',
  isFocusedBinding: 'App.typingAreaController.current_snippet.focused',

  isBlurry: function () {
    return !this.get('isFocused');
  }.property('isFocused'),

  click: function (e) {
    $('.' + this.text.className).focus();
  },

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

  focusIn:  function (e) { this.text.set('focused', true);  },
  focusOut: function (e) { this.text.set('focused', false); }
});

// center the focus nag on the typing area
App.centerFocusNag = function () {
  if (App.typingAreaController.current_snippet === null) {
    return;
  }

  var text_area = $('.' + App.typingAreaController.current_snippet.className);
  var focus_nag = $('.' + App.typingAreaController.current_snippet.focusNagClass);
  if (text_area.length === 0 || focus_nag.length === 0) {
    return;
  }

  var text_area_offset = text_area.offset();
  focus_nag.css({
    top:  text_area_offset.top + ((text_area.height() / 2) - (focus_nag.height() / 2)),
    left: text_area_offset.left + ((text_area.width() / 2) - (focus_nag.width() / 2))
  });
};

App.typingAreaController = Ember.Object.create({
  current_snippet: null,

  finishedObserver: function () {
    if (this.current_snippet.finished) {
      // save score here
      this.newSnippet();
    }
  }.observes('current_snippet.finished'),

  newSnippet: function () {
    var self = this;
    $.get('/snippets/random', function (snippet_str) {
      snippet_str = App.util.chomp(snippet_str);
      self.set('current_snippet', App.TypingText.create({full_string: snippet_str}));

      // TODO centerFocusNag behavior needs to happen properly on first draw
      //   Not this way. this is a hack. this is sad.
      setTimeout(function () { App.centerFocusNag(); }, 10);
      setTimeout(function () { $('.' + self.current_snippet.className).focus(); }, 10);
    });
  },

  focusChanged: function () {
    if (!this.current_snippet.focused) {
      App.centerFocusNag();
    }
  }.observes('current_snippet.focused')
});

App.typingAreaController.newSnippet();

// some reference for character codes:
// var chr_from_int = String.fromCharCode(34);
// var int_from_chr = '"'.charCodeAt(0)

App.notAKeypress = function (e) {
  if (e.which == App.KEY_BACKSPACE) { return true; }
  // tab in keypress shows as 0
  if (e.which == 0)                 { return true; }
  return false;
};

App.setPreventDefaultForKey = function (e) {
  // in OSX, 'delete' goes back a page. undesirable!
  if (e.which == App.KEY_BACKSPACE)       { e.preventDefault();   }

  // in firefox, single quote and forward slash do a "quick search"
  if (e.which == App.KEY_SINGLE_QUOTE)    { e.preventDefault();   }
  if (e.which == App.KEY_FORWARD_SLASH)   { e.preventDefault();   }

  // tab shouldn't take us out of the typing window
  if (e.which == App.KEY_TAB)             { e.preventDefault();   }
};

$(document).bind('keyPress keyDown', function (e) {
  App.setPreventDefaultForKey(e);
});
