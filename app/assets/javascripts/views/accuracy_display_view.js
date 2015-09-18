App.AccuracyDisplayView = Ember.View.extend({
  tagName: 'span',
  templateName: 'accuracy-display',
  classNames: ['stat-counter'],
  textBinding: Ember.Binding.oneWay('controller.controllers.typing_area.current_snippet')
});