import Ember from 'ember';

export default Ember.Component.extend({
  classNameBindings: ['focusNagClass', 'isFocused:hidden'],
  focusNagClass: 'focus-nag',

  isFocused: Ember.computed.alias('parentView.focused')
});
