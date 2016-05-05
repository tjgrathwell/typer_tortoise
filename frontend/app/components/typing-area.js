import Ember from 'ember';
import KeyHandling from 'frontend/keys';

export default Ember.Component.extend({
  classNames: 'type-area-container',
  text: Ember.computed.oneWay('typing_area.current_snippet'),

  focused: false,

  actions: {
    showCategory: function (categoryId) {
      this.sendAction('showCategory', categoryId);
    },
  },

  keyDown: function (e) {
    KeyHandling.setPreventDefaultForKey(e);
    if (e.which === KeyHandling.CODES.BACKSPACE) {
      this.get('text').backUp();
    }
    if (e.which === KeyHandling.CODES.TAB) {
      this.get('text').tabPressed();
    }
    if (e.which === KeyHandling.CODES.SPACE) {
      this.get('text').typeOn(' ');
    }
  },

  keyPress: function (e) { // keyDown doesn't account for shift key
    KeyHandling.setPreventDefaultForKey(e);
    if (KeyHandling.notAKeypress(e)) {
      return;
    }

    var chr = String.fromCharCode(e.which);

    // normalize newlines
    if (chr === '\r') { chr = '\n'; }

    this.get('text').typeOn(chr);
  },

  didInsertElement: function () {
    this._super();
    this.$().fadeIn();
    this.$().find('.type-panel').focus();
    $(document).on('keypress.typingArea keydown.typingArea', function (e) {
      KeyHandling.setPreventDefaultForKey(e);
    });
  },

  willDestroyElement: function () {
    $(document).off('.typingArea');
  },

  focusIn: function (e) { this.set('focused', true); },
  focusOut: function (e) { this.set('focused', false); }
});
