import Ember from 'ember';

export default Ember.View.extend({
  tagName: 'span',
  templateName: 'wpm-display',
  classNames: ['stat-counter'],
  textBinding: Ember.Binding.oneWay('controller.controllers.typing_area.current_snippet')
});
