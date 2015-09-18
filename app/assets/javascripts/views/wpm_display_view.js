App.WpmDisplayView = Em.View.extend({
  tagName: 'span',
  templateName: 'wpm-display',
  classNames: ['stat-counter'],
  textBinding: Em.Binding.oneWay('controller.controllers.typing_area.current_snippet')
});