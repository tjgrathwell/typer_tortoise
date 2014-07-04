App.views.TypingArea = Em.View.extend({
    templateName: 'typing-area',
    classNames: 'type-area-container',
    textBinding: Em.Binding.oneWay('App.typingAreaController.current_snippet'),

    focused: false,

    keyDown: function (e) {
        App.setPreventDefaultForKey(e);
        if (e.which == App.KEY_BACKSPACE) {
            this.text.backUp();
        }
        if (e.which == App.KEY_TAB) {
            this.text.tabPressed();
        }
        if (e.which == App.KEY_SPACE) {
            this.text.typeOn(' ');
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
        if (!this.$() || this.$().length === 0) { return; }
        this.$().fadeIn('slow');
        this.$().find('.type-panel').focus();
    }.observes('text'),

    focusIn:  function (e) { this.set('focused', true);  },
    focusOut: function (e) { this.set('focused', false); }
});
