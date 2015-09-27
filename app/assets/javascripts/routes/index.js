App.IndexRoute = Ember.Route.extend(App.SnippetPlayingRoute, {
  model: function (params) {
    return this.controllerFor('typing_area').newSnippet();
  }
});