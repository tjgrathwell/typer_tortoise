App.WPMDisplay = Em.View.create({
  tagName: 'span',
  templateName: 'wpm-display',
  classNames: ['stat-counter'],

  textBinding: Em.Binding.oneWay('App.typingAreaController.current_snippet')
});

App.AccuracyDisplay = Em.View.create({
  tagName: 'span',
  templateName: 'accuracy-display',
  classNames: ['stat-counter'],

  textBinding: Em.Binding.oneWay('App.typingAreaController.current_snippet')
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

App.TypingArea = Em.View.create({
  templateName: 'typing-area',
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
    if (!this.$() || this.$().length === 0) { return; }
    this.$().fadeIn('slow');
    this.$().find('.type-panel').focus();
  }.observes('text'),

  focusIn:  function (e) { this.set('focused', true);  },
  focusOut: function (e) { this.set('focused', false); }
});

App.set('typingAreaController', Em.Object.create({
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
  }
}));

App.set('scoresController', Em.ArrayController.create({
  content: [],

  loadScores: function (score) {
    $.get('/scores/', (function (json) {
      this.set('content', json);
    }).bind(this));
  },

  add: function (score) {
    this.pushObject(score);
  }
}));

App.ScoreItemView = Em.View.extend({});

App.ScoreListView = Em.View.create({
  templateName: 'player-scores'
});

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

App.prefsSaveButton = Em.View.extend({
  tagName: 'button',
  click: function (e) {
    var pref_controller = App.get('categoryPrefController');
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
  }
});