import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['blue-round', 'prefs-popup'],

  click: function (e) {
    e.stopPropagation();
  }
});
