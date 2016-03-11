import Ember from 'ember';

export default Ember.Mixin.create({
  application: Ember.inject.controller(),
  typing_area: Ember.inject.controller(),
  scores: Ember.inject.controller(),

  checkFinishedAndProceed: function () {
    var typingAreaController = this.get('typing_area');
    if (typingAreaController.get('current_snippet').finished) {
      typingAreaController.saveScore();
      var routeName = this.get('application.currentRouteName');
      if (routeName === 'snippet.play') {
        // Go to the root route to indicate "random play mode" has resumed
        this.transitionToRoute('index');
      } else {
        typingAreaController.newSnippet();
      }
    }
  }
});
