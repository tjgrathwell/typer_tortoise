App.SnippetPlayController = Ember.ObjectController.extend({
  needs: ['application', 'typing_area', 'scores'],
  isActive: Ember.computed.equal('controllers.application.currentRouteName', 'snippet.play'),

  finishedObserver: function () {
    if (!this.get('isActive')) {
      return;
    }

    var typingAreaController = this.get('controllers.typing_area');
    if (typingAreaController.get('current_snippet').finished) {
      typingAreaController.saveScore();
      // reset the URL from pointing at a specific snippet (/snippets/15/play)
      // to the root URL (/) to indicate "random play mode" has resumed
      // TODO: Use something like transitionTo instead
      if (App.history.pageToken().match('/play')) {
        App.history.setPageToken('/');
      }
      typingAreaController.newSnippet();
    }
  }.observes('controllers.typing_area.current_snippet.finished'),
});