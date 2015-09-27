App.SnippetRoute = Ember.Route.extend({
  model: function (params) {
    return this.controllerFor('typing_area').newSnippet(params.snippet_id);
  },

  setupController: function (controller, model) {
    controller.set('model', model);
  }
});
