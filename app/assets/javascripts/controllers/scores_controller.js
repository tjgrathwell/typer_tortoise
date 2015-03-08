App.controllers.ScoresController = Em.ArrayController.extend({
  loadScores: function (score) {
    $.get('/scores/', (function (json) {
      this.set('model', json);
    }).bind(this));
  },

  add: function (score) {
    this.pushObject(score);
  }
});
