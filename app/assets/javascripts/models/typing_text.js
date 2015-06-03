App.models.TypingText = Em.Object.extend({
  full_string: null,
  snippet_id: null,
  category_id: null,

  init: function () {
    this._super();
    this.set('mistakes', []);

    this.set('total_mistakes', 0);
    this.set('cursor_pos', 0);

    this.set('start_time', null);
    this.set('wpm_timer_id', null);
    this.set('wpm_ticks', null);

    this.set('finished', false);

    this._normalizeSnippet();
    var commentParser = App.services.CommentParser;
    debugger;
    if (commentParser.canParseComments(this.category_name)) {
      this.set('comment_ranges', commentParser.computeCommentRanges(this.category_name, this.full_string));
      this._skipComments();
    }
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

  tabSize: function () {
    if (this.get('_tab_size')) {
      return this.get('_tab_size');
    }

    var indents = [];

    // guess the indent size to be however deeply indented the first indented line is
    var lines = this.full_string.split('\n');
    lines.forEach(function (line) {
      var match = line.match('^(\\s+)');
      if (match) {
        indents.push(match[1].length);
      }
    });

    this.set('_tab_size', indents[0]);
    return indents[0];
  },

  //
  // rendering bookkeeping
  //
  renderedText: function () {
    function annotateText(text, klass) {
      return "<span class='" + klass + "'>" + text + "</span>";
    }

    var cursorClasses = ['type-cursor'];
    if (this.mistakes.length > 0) {
      cursorClasses.push('has-mistakes');
    }
    var parts = [
      annotateText(this._beforeCursor(), 'before-cursor'),
      annotateText(this._renderedCursor(), cursorClasses.join(' ')),
      annotateText(this._afterCursor(), 'after-cursor')
    ];
    return parts.join('');
  }.property('cursor_pos', 'mistakes.length'),

  _decoratedSubstring: function (cursorStart, cursorEnd) {
    function escape(text) {
      return Ember.Handlebars.Utils.escapeExpression(text)
    }

    var result = [];
    var index = cursorStart;
    var commentRanges = (this.comment_ranges || []);
    for (var i = 0; i < commentRanges.length; i++) {
      var commentRange = commentRanges[i];
      if (commentRange[0] > cursorEnd) {
        break;
      }
      if (commentRange[1] < cursorStart) {
        continue;
      }

      result.push(escape(this.full_string.substr(index, commentRange[0] - index)));
      result.push('<span class="comment">');
      result.push(escape(this.full_string.substr(commentRange[0], commentRange[1] - commentRange[0])));
      result.push('</span>');
      index = commentRange[1];
    }
    result.push(escape(this.full_string.substr(index, cursorEnd - index)));
    return result.join('');
  },

  _beforeCursor: function () {
    return this._decoratedSubstring(0, this.cursor_pos);
  },

  _atCursor: function () {
    if (this.mistakes.length > 0) {
      var mistakesString = this.mistakes.join('');
      if (this._onlySpacesOnCurrentLine() && (mistakesString.length % this.tabSize()) == 0) {
        return mistakesString.replace(/ /g, '&larr;');
      } else {
        return mistakesString;
      }
    }

    return this.full_string.substr(this.cursor_pos, 1);
  },

  _renderedCursor: function () {
    var cursorStr = this._atCursor();
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
  },

  _afterCursor: function () {
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
    return this._decoratedSubstring(adjustedCursor, this.full_string.length);
  },

  //
  // synthesized typing quality data
  //
  realTypedCharacters: function () {
    var characters = this.cursor_pos;
    var commentRanges = this.get('comment_ranges') || [];
    for (var i = 0; i < commentRanges.length; i++) {
      var commentRange = commentRanges[i];
      if (this.cursor_pos < commentRange[0]) {
        break;
      }

      characters -= (commentRange[1] - commentRange[0]);
    }
    return characters;
  },

  wpm: function () {
    if (this.start_time === null) { return 0; }

    var now = (new Date()).getTime();
    var minutes = (now - this.start_time) / (1000 * 60);

    if (minutes < 0.05) {
      return 0;
    }

    var wpm_raw = (this.realTypedCharacters() / 5.0) / minutes;

    return wpm_raw.toFixed();
  }.property('wpm_ticks'),

  accuracy: function () {
    var realTypedCharacters = this.realTypedCharacters();
    if (realTypedCharacters === 0) {
      return 100;
    }

    if (realTypedCharacters < this.total_mistakes) {
      return 0;
    }

    var raw_acc = (realTypedCharacters - this.total_mistakes) / realTypedCharacters;
    return (raw_acc * 100).toFixed(0);
  }.property('cursor_pos', 'total_mistakes'),

  _startWpmTimer: function () {
    this.set('start_time', (new Date()).getTime());

    var self = this;
    var timer_id = window.setInterval(function () {
      self.set('wpm_ticks', this.wpm_ticks + 1);
    }, 250);

    this.set('wpm_timer_id', timer_id);
  },

  _stopWpmTimer: function () {
    this.set('finished', true);
    window.clearInterval(this.wpm_timer_id);
  },

  _previousLineIndent: function () {
    var lines = this.full_string.substr(0, this.cursor_pos).split('\n');
    if (lines.length < 2) return;

    var prev_line = lines[lines.length - 2];
    return App.util.leadingWhitespaceCount(prev_line);
  },

  _autoIndent: function () {
    var spaces = this._previousLineIndent();
    App.util.repeat(function () { this.typeOn(' ') }, spaces, this);
  },

  _skipComments: function () {
    var skipped = false;

    if (this.comment_ranges) {
      for (var i = 0; i < this.comment_ranges.length; i++) {
        var commentRange = this.comment_ranges[i];
        if (this.cursor_pos == commentRange[0]) {
          this.set('cursor_pos', commentRange[1] + 1);
          skipped = true;
        }
      }
    }
    return skipped;
  },

  _cursorInComment: function (cursorPos) {
    if (!this.comment_ranges) return;

    for (var i = 0; i < this.comment_ranges.length; i++) {
      var commentRange = this.comment_ranges[i];
      if (commentRange[0] <= cursorPos && commentRange[1] >= cursorPos) {
        return true;
      }
    }
    return false;
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
      var skipped = this._skipComments();
      if (skipped || (chr === '\n')) {
        this._autoIndent();
      }
    } else {
      if (chr != ' ') {
        this.set('total_mistakes', this.total_mistakes + 1);
      }
      this.mistakes.pushObject(chr);
    }

    // clear the wpm timer if the snippet is finished
    if (this.cursor_pos === this.full_string.length) this._stopWpmTimer();
  },

  tabPressed: function () {
    App.util.repeat(function () { this.typeOn(' ') }, this.tabSize(), this);
  },

  backUp: function () {
    if (this.finished) return;

    if (this.cursor_pos === 0 && this.mistakes.length === 0) return;

    if (this._cursorInComment(this.cursor_pos - 1)) return;

    var repeatCount = 1;

    var spaces = App.util.trailingWhitespaceCount(this._currentLine());
    // if there's at least one tab worth of trailing whitespace on this line,
    //   'tab' backwards
    if (this._onlySpacesOnCurrentLine() && (spaces % this.tabSize()) == 0) {
      repeatCount = this.tabSize();
    }

    App.util.repeat(function () {
      if (this.mistakes.length > 0) {
        this.mistakes.popObject();
      } else {
        this.set('cursor_pos', this.cursor_pos - 1);
      }
    }, repeatCount, this);
  },

  _currentLine: function () {
    var lines = (this._beforeCursor() + this.mistakes.join('')).split('\n');
    return lines[lines.length - 1];
  },

  _onlySpacesOnCurrentLine: function () {
    return !!this._currentLine().match(/^ +$/);
  },

  //
  // output
  //
  getScore: function () {
    return App.models.Score.create({
      snippet_id: this.snippet_id,
      wpm: this.get('wpm'),
      accuracy: this.get('accuracy')
    });
  }
});
