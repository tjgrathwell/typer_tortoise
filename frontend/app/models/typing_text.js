import Ember from 'ember';
import DS from 'ember-data';
import Utilities from 'frontend/util';
import SnippetNormalizer from 'frontend/services/snippet_normalizer';
import CommentParser from 'frontend/services/comment_parser';

const WpmTimer = Ember.Object.extend({
  schedule: function (f) {
    Ember.run.later(this, function () {
      f();
      this.set('timer', this.schedule(f));
    }, 250);
  },

  stop: function () {
    Ember.run.cancel(this.get('timer'));
  }
});

export default Ember.Object.extend({
  snippet: null,
  wpmTimer: WpmTimer.create(),

  init: function () {
    this._super();
    this.set('mistakes', []);

    this.set('totalMistakes', 0);
    this.set('cursorPos', 0);

    this.set('startTime', null);
    this.set('wpmTicks', null);

    this.set('finished', false);

    this.set('fullString', SnippetNormalizer.normalizeSnippet(this.get('snippet.fullText')));

    if (CommentParser.canParseComments(this.get('snippet.categoryName'))) {
      this.set(
        'comment_ranges',
        CommentParser.computeCommentRanges(this.get('snippet.categoryName'), this.get('fullString'))
      );
      this._skipComments();
    }
  },

  tabSize: function () {
    if (this.get('_tab_size')) {
      return this.get('_tab_size');
    }

    var indents = [];

    // guess the indent size to be however deeply indented the first indented line is
    var lines = this.get('fullString').split('\n');
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
      return `<span class='${klass}'>${text}</span>`;
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
  }.property('cursorPos', 'mistakes.length'),

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

      result.push(escape(this.get('fullString').substr(index, commentRange[0] - index)));
      result.push('<span class="comment">');
      result.push(escape(this.get('fullString').substr(commentRange[0], commentRange[1] - commentRange[0])));
      result.push('</span>');
      index = commentRange[1];
    }
    result.push(escape(this.get('fullString').substr(index, cursorEnd - index)));
    return result.join('');
  },

  _beforeCursor: function () {
    return this._decoratedSubstring(0, this.cursorPos);
  },

  _atCursor: function () {
    if (this.mistakes.length > 0) {
      var mistakesString = this.mistakes.join('');
      if (this._onlySpacesOnCurrentLine() && (mistakesString.length >= this.tabSize())) {
        var arrayOfCharacter = function (chr, count) {
          return Array.apply(null, new Array(count)).map(() => chr);
        };

        // TODO: find a way to draw long arrows that works in firefox
        // (currently the arrow body doesn't match up to the arrow head very well)
        var spaces = arrayOfCharacter(' ', this.tabSize());
        var arrow = arrayOfCharacter('&#9135;', this.tabSize());
        arrow[0] = '&larr;';

        return mistakesString.replace(new RegExp(spaces.join(''), 'g'), arrow.join(''));
      } else {
        return mistakesString;
      }
    }

    return this.get('fullString').substr(this.cursorPos, 1);
  },

  _renderedCursor: function () {
    var cursorStr = this._atCursor();
    return cursorStr.split('').map(chr => {
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
    //   any \n between (cursorPos) and (cursorPos + mistakes.length)
    var clobberedArea = this.get('fullString').substr(this.cursorPos, this.mistakes.length);
    if (clobberedArea.indexOf('\n') >= 0) {
      adjustedCursor = this.cursorPos + clobberedArea.indexOf('\n');
    } else {
      adjustedCursor = this.cursorPos + this.mistakes.length;
    }

    var this_char = this.get('fullString').substr(this.cursorPos, 1);
    if (this.mistakes.length === 0 && this_char !== '\n') {
      // If we have no mistakes, one character is reserved for the 'atCursor' point.
      // EXCEPT if that character is a newline: the newline always comes in the
      //   afterCursor section, so we leave the cursor alone.
      adjustedCursor += 1;
    }
    return this._decoratedSubstring(adjustedCursor, this.get('fullString').length);
  },

  //
  // synthesized typing quality data
  //
  realTypedCharacters: function () {
    var characters = this.cursorPos;
    var commentRanges = this.get('comment_ranges') || [];
    for (var i = 0; i < commentRanges.length; i++) {
      var commentRange = commentRanges[i];
      if (this.cursorPos < commentRange[0]) {
        break;
      }

      characters -= (commentRange[1] - commentRange[0]);
    }
    return characters;
  },

  wpm: function () {
    var secondsSpentTyping = this.get('secondsSpentTyping');
    if (secondsSpentTyping === 0) {
      return 0;
    }

    var minutesSpentTyping = secondsSpentTyping / 60;
    var wpm_raw = (this.realTypedCharacters() / 5.0) / minutesSpentTyping;

    return wpm_raw.toFixed();
  }.property('secondsSpentTyping'),

  showWpm: function () {
    return this.get('secondsSpentTyping') > 3;
  }.property('secondsSpentTyping'),

  secondsSpentTyping: function () {
    if (this.startTime === null) { return 0; }

    var now = (new Date()).getTime();
    return (now - this.startTime) / 1000;
  }.property('wpmTicks'),

  accuracy: function () {
    var realTypedCharacters = this.realTypedCharacters();
    if (realTypedCharacters === 0) {
      return 100;
    }

    if (realTypedCharacters < this.totalMistakes) {
      return 0;
    }

    var raw_acc = (realTypedCharacters - this.totalMistakes) / realTypedCharacters;
    return (raw_acc * 100).toFixed(0);
  }.property('cursorPos', 'totalMistakes'),

  _previousLineIndent: function () {
    var lines = this.get('fullString').substr(0, this.cursorPos).split('\n');
    if (lines.length < 2) {
      return;
    }

    var prev_line = lines[lines.length - 2];
    return Utilities.leadingWhitespaceCount(prev_line);
  },

  _autoIndent: function () {
    var spaces = this._previousLineIndent();
    Utilities.repeat(function () { this.typeOn(' ') }, spaces, this);
  },

  _skipComments: function () {
    var skipped = false;

    if (this.comment_ranges) {
      for (var i = 0; i < this.comment_ranges.length; i++) {
        var commentRange = this.comment_ranges[i];
        if (this.cursorPos === commentRange[0]) {
          this.set('cursorPos', commentRange[1] + 1);
          skipped = true;
        }
      }
    }
    return skipped;
  },

  _cursorInComment: function (cursorPos) {
    if (!this.comment_ranges) {
      return;
    }

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
    if (this.finished) {
      return;
    }

    // start the wpm timer if this is the first character typed
    if (this.startTime === null) {
      if (this.enableTimer) {
        this.set('startTime', (new Date()).getTime());

        this.get('wpmTimer').schedule(() => {
          this.set('wpmTicks', this.wpmTicks + 1);
        });
      }
    }

    var cursor_matches = this.get('fullString').substr(this.get('cursorPos'), 1) === chr;
    var no_mistakes = this.mistakes.length === 0;
    if (no_mistakes && cursor_matches) {
      this.set('cursorPos', this.cursorPos + 1);
      var skipped = this._skipComments();
      if (skipped || (chr === '\n')) {
        this._autoIndent();
      }
    } else {
      if (chr !== ' ') {
        this.set('totalMistakes', this.totalMistakes + 1);
      }
      this.mistakes.pushObject(chr);
    }

    // clear the wpm timer if the snippet is finished
    if (this.cursorPos === this.get('fullString').length) {
      this.get('wpmTimer').stop();
      this.set('finished', true);
    }
  },

  tabPressed: function () {
    Utilities.repeat(function () { this.typeOn(' ') }, this.tabSize(), this);
  },

  backUp: function () {
    if (this.finished) {
      return;
    }

    if (this.cursorPos === 0 && this.mistakes.length === 0) {
      return;
    }

    if (!this.mistakes.length && this._cursorInComment(this.cursorPos - 1)) {
      return;
    }

    var repeatCount = 1;

    var spaces = Utilities.trailingWhitespaceCount(this._currentLine());
    // if there's at least one tab worth of trailing whitespace on this line,
    //   'tab' backwards
    if (this._onlySpacesOnCurrentLine() && (spaces % this.tabSize()) === 0) {
      repeatCount = this.tabSize();
    }

    Utilities.repeat(function () {
      if (this.mistakes.length > 0) {
        this.mistakes.popObject();
      } else {
        this.set('cursorPos', this.cursorPos - 1);
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
  getScoreAttributes: function () {
    return {
      snippet: this.get('snippet'),
      wpm: this.get('wpm'),
      accuracy: this.get('accuracy')
    };
  }
});
