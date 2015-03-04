App.SnippetsIndexRoute = Ember.Route.extend({
  model: function () {
    return Ember.$.getJSON('/snippets.json');
  },

  setupController: function (controller, model) {
    controller.set('model', model);
  }
});
