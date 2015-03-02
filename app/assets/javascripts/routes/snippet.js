App.SnippetRoute = Ember.Route.extend({
  model: function (params) {
    // TODO: This is done more for the side-effect than to return a 'model'.
    var controller = App.get('typingAreaController');
    if (controller) {
      return controller.newSnippet(params.snippet_id);
    }
  },
});
