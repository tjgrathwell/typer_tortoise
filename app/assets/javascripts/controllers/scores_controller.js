App.controllers.ScoresController = Em.ArrayController.extend({
  content: [],

  loadScores: function (score) {
    $.get('/scores/', (function (json) {
      this.set('content', json);
    }).bind(this));
  },

  add: function (score) {
    this.pushObject(score);
  }
});
