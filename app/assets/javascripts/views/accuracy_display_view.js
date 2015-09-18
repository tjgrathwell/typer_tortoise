App.AccuracyDisplayView = Em.View.extend({
  tagName: 'span',
  templateName: 'accuracy-display',
  classNames: ['stat-counter'],
  textBinding: Em.Binding.oneWay('controller.controllers.typing_area.current_snippet')
});