import Ember from 'ember';

export default Ember.ArrayController.extend({
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
    this.pushObject(score);
  }
});
