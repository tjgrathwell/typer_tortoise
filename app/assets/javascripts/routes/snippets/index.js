App.SnippetsIndexRoute = Ember.Route.extend({
  model: function () {
    return Ember.$.getJSON('/snippets');
  },

  setupController: function (controller, model) {
    controller.set('model', model);
  }
});
