App.SnippetPlayRoute = Ember.Route.extend({
  setupController: function (controller, model) {
    controller.set('model', model);
  },

  renderTemplate: function () {
    this.render('snippet/play');
  }
});