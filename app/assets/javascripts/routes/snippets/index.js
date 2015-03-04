App.SnippetsIndexRoute = Ember.Route.extend({
  model: function (params) {
    return Ember.$.getJSON('/snippets.json');
  },

  setupController: function (controller, model) {
    controller.set('model', model);
  }
});
