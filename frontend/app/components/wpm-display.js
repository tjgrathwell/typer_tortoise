import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'span',
  classNames: ['stat-counter'],
  text: Ember.computed.oneWay('typing_area.current_snippet')
});
