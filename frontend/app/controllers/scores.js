import Ember from 'ember';

export default Ember.Controller.extend({
  init: function () {
    this._super();
    this.loadScores();
  },

  loadScores: function (score) {
    Ember.$.getJSON('/scores', (function (json) {
      this.set('model', json);
    }).bind(this));
  },

  add: function (score) {
    this.get('model').pushObject(score);
  }
});
