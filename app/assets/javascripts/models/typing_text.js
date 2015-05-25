App.models.TypingText = Em.Object.extend({
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
        this._computeCommentRanges();
        this._skipComments();
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

    _computeCommentRanges: function () {
        if (this.category_name == 'ruby') {
            var highlighted = hljs.highlight(this.category_name, this.full_string).value;
            var $highlighted = $('<div>' + highlighted + '</div>');
            var TEXT_NODE = 3;
            var index = 0;
            var commentRanges = [];
            $highlighted.contents().each((function (ix, node) {
                if (node.nodeType == TEXT_NODE) {
                    index += node.length;
                    return;
                }
                var innerTextLength = node.innerText.length;
                if (node.classList == 'hljs-comment') {
                    var indexIncludingWhitespace = index;
                    while (this.full_string[indexIncludingWhitespace - 1] == ' ') {
                        indexIncludingWhitespace = indexIncludingWhitespace - 1;
                    }
                    commentRanges.push([indexIncludingWhitespace, index + innerTextLength]);
                }
                index += innerTextLength;
            }).bind(this));
            this.set('comment_ranges', commentRanges);
        }
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

      function escape (text) {
        return Ember.Handlebars.Utils.escapeExpression(text);
      }

      var cursorClasses = ['type-cursor'];
      if (this.mistakes.length > 0) {
        cursorClasses.push('has-mistakes');
      }
      var parts = [
        annotateText(escape(this.get('beforeCursor')), 'before-cursor'),
        annotateText(this.get('renderedCursor'), cursorClasses.join(' ')),
        annotateText(escape(this.get('afterCursor')), 'after-cursor')
      ];
      return parts.join('');
    }.property('cursor_pos', 'mistakes.length'),

    beforeCursor: function () {
        return this.full_string.substr(0, this.cursor_pos);
    }.property('cursor_pos'),

    atCursor: function () {
        if (this.mistakes.length > 0) {
            return this.mistakes.join('');
        }

        return this.full_string.substr(this.cursor_pos, 1);
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
        var lines = this.get('beforeCursor').split('\n');
        if (lines.length < 2) return;

        var prev_line = lines[lines.length - 2];
        return App.util.leadingWhitespaceCount(prev_line);
    },

    _autoIndent: function () {
        var spaces = this._previousLineIndent();
        App.util.repeat(function () { this.typeOn(' ') }, spaces, this);
    },

    _skipComments: function () {
        // TODO: backspacing over comments
        // TODO: mistakes on comments
        // TODO: WPM compensating for comments

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
            this.set('total_mistakes', this.total_mistakes + 1);
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

        var lines = (this.get('beforeCursor') + this.get('atCursor')).split('\n');
        var current_line = lines[lines.length-1];
        // if there's at least one tab worth of trailing whitespace on this line,
        //   'tab' backwards
        if (App.util.trailingWhitespaceCount(current_line) >= this.tabSize()) {
            App.util.repeat(function () { this._backUp() }, this.tabSize(), this);
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
        return App.models.Score.create({
            snippet_id: this.snippet_id,
            wpm: this.get('wpm'),
            accuracy: this.get('accuracy')
        });
    }
});
