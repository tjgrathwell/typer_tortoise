import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'span',
  classNames: ['stat-counter'],
  classNameBindings: ['text.showWpm::hidden'],
  text: Ember.computed.oneWay('typingArea.currentSnippet')
});
