import Ember from 'ember';

export default Ember.Controller.extend({
  init: function () {
    this._super();
    this.loadScores();
  },

  loadScores: function (score) {
    this.store.findAll('score').then((function (scores) {
      this.set('model', scores);
    }).bind(this));
  }
});
