import Ember from 'ember';

export default Ember.Controller.extend({
  application: Ember.inject.controller(),
  typingArea: Ember.inject.controller(),
  scores: Ember.inject.controller(),

  finishedObserver: function () {
    var typingAreaController = this.get('typingArea');
    var currentSnippet = typingAreaController.get('currentSnippet');
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
  }.observes('typingArea.currentSnippet.finished')
});
