import Ember from 'ember';
import SnippetPlayingController from 'frontend/mixins/snippet_playing_controller';

export default Ember.Controller.extend(SnippetPlayingController, {
  isActive: Ember.computed.equal('controllers.application.currentRouteName', 'snippet.play')
});
