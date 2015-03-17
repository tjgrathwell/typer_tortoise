App.SnippetRoute = Ember.Route.extend({
  model: function (params) {
    // TODO: This is done more for the side-effect than to return a 'model'.
    return this.controllerFor('typing_area').newSnippet(params.snippet_id);
  },

  setupController: function (controller, model) {
    controller.set('model', model);
  }
});
