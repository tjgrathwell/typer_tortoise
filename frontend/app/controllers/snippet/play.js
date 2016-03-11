import Ember from 'ember';
import SnippetPlayingController from 'frontend/mixins/snippet_playing_controller';

export default Ember.Controller.extend(SnippetPlayingController, {
  finishedObserver: function () {
    this.checkFinishedAndProceed();
  }.observes('typing_area.current_snippet.finished')
});
