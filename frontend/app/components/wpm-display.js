import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'span',
  classNames: ['stat-counter'],
  classNameBindings: ['text.showWpm::hidden'],
  text: Ember.computed.oneWay('typing_area.current_snippet')
});
