App.views.WPMDisplay = Em.View.extend({
  tagName: 'span',
  templateName: 'wpm-display',
  classNames: ['stat-counter']
});

App.views.AccuracyDisplay = Em.View.extend({
  tagName: 'span',
  templateName: 'accuracy-display',
  classNames: ['stat-counter']
});

App.views.FocusNag = Em.View.extend({
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

App.views.TypingArea = Em.View.extend({
  templateName: 'typing-area',
  classNames: 'type-area-container',

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
    if (!this.$() || this.$().length === 0) { return; }
    this.$().fadeIn('slow');
    this.$().find('.type-panel').focus();
  }.observes('text'),

  focusIn:  function (e) { this.set('focused', true);  },
  focusOut: function (e) { this.set('focused', false); }
});

App.views.ScoreItemView = Em.View.extend({});

App.views.ScoreListView = Em.View.extend({
  templateName: 'player-scores'
});

//
//  category preferences stuff
//

App.views.PrefsLink = Em.View.extend({
  templateName: 'prefs-link',
  tagName: 'span',
  classNames: ['prefs-link'],

  click: function () {
    App.get('categoryPrefController').showPreferences();
  }
});

App.views.PrefsSaveButton = Em.View.extend({
  tagName: 'button',
  click: function (e) {
    var pref_controller = App.get('categoryPrefController');
    pref_controller.saveCategories(function () {
      pref_controller.hidePreferences();
      App.get('typingAreaController').changeSnippetToCategory(pref_controller.enabledCategoryIds());
    });
  }
});

App.views.PrefsPopup = Em.View.extend({
  templateName: 'prefs-popup',
  classNames: ['prefs-popup-bg'],

  click: function () {
    this.destroy();
  }
});

App.views.PrefsPopupContent = Em.View.extend({
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
  }
});