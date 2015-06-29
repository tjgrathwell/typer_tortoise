App.SnippetPlayingController = Ember.Mixin.create({
  needs: ['application', 'typing_area', 'scores'],

  finishedObserver: function () {
    if (!this.get('isActive')) {
      return;
    }

    var typingAreaController = this.get('controllers.typing_area');
    if (typingAreaController.get('current_snippet').finished) {
      typingAreaController.saveScore();
      var routeName = this.get('controllers.application.currentRouteName');
      if (routeName == 'snippet.play') {
        // Go to the root route to indicate "random play mode" has resumed
        this.transitionToRoute('index');
      } else {
        typingAreaController.newSnippet();
      }
    }
  }.observes('controllers.typing_area.current_snippet.finished')
});