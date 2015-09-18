App.WpmDisplayView = Em.View.extend({
  tagName: 'span',
  templateName: 'wpm-display',
  classNames: ['stat-counter'],
  textBinding: Em.Binding.oneWay('controller.controllers.typing_area.current_snippet')
});

App.AccuracyDisplayView = Em.View.extend({
  tagName: 'span',
  templateName: 'accuracy-display',
  classNames: ['stat-counter'],
  textBinding: Em.Binding.oneWay('controller.controllers.typing_area.current_snippet')
});

App.FocusNagView = Em.View.extend({
  classNameBindings: ['focusNagClass', 'isFocused:hidden'],
  focusNagClass: 'focus-nag',

  isFocusedBinding: 'parentView.focused'
});

App.PlayerScoresView = Em.View.extend({
  templateName: 'player-scores'
});
