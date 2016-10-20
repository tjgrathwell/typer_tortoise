import Ember from 'ember';

export default Ember.Controller.extend({
  init: function () {
    this._super();
    this.loadScores();
  },

  recent: function() {
    if (!this.get('model')) {
      return [];
    }
    return this.get('model').slice(Math.max(this.get('model.length') - 5));
  }.property('model.@each'),

  loadScores: function (score) {
    this.store.findAll('score').then((scores) => {
      this.set('model', scores);
    });
  }
});
