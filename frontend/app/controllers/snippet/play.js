import Ember from 'ember';

export default Ember.Controller.extend({
  application: Ember.inject.controller(),
  typing_area: Ember.inject.controller(),
  scores: Ember.inject.controller(),

  finishedObserver: function () {
    var typingAreaController = this.get('typing_area');
    var currentSnippet = typingAreaController.get('current_snippet');
    if (currentSnippet && currentSnippet.finished) {
      typingAreaController.saveScore();
      var routeName = this.get('application.currentRouteName');
      if (routeName === 'snippet.play') {
        // Go to the root route to indicate "random play mode" has resumed
        this.transitionToRoute('index');
      } else {
        typingAreaController.newSnippet();
      }
    }
  }.observes('typing_area.current_snippet.finished')
});
