App.SnippetsIndexRoute = Ember.Route.extend({
  model: function () {
    return Ember.$.getJSON('/snippets');
  },

  setupController: function (controller, model) {
    controller.set('model', model);
    controller.set('category_id', App.storage.get('typer_tortoise.filtered_category_id'));
  }
});
