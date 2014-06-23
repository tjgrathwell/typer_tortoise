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

  isFocusedBinding: 'parentView.focused'
});

App.views.ScoreItemView = Em.View.extend({});

App.views.ScoreListView = Em.View.extend({
  templateName: 'player-scores'
});
