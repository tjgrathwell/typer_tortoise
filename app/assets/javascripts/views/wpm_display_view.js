App.WpmDisplayView = Ember.View.extend({
  tagName: 'span',
  templateName: 'wpm-display',
  classNames: ['stat-counter'],
  textBinding: Ember.Binding.oneWay('controller.controllers.typing_area.current_snippet')
});