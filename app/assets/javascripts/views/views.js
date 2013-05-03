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

App.views.ScoreItemView = Em.View.extend({});

App.views.ScoreListView = Em.View.extend({
  templateName: 'player-scores'
});
