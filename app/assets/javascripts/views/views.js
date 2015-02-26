App.views.WPMDisplay = Em.View.extend({
  tagName: 'span',
  templateName: 'wpm-display',
  classNames: ['stat-counter'],
  textBinding: Em.Binding.oneWay('App.typingAreaController.current_snippet')
});

App.views.AccuracyDisplay = Em.View.extend({
  tagName: 'span',
  templateName: 'accuracy-display',
  classNames: ['stat-counter'],
  textBinding: Em.Binding.oneWay('App.typingAreaController.current_snippet')
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
