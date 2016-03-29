import Ember from 'ember';
import SnippetPlayingRoute from 'frontend/mixins/snippet_playing_route'

export default Ember.Route.extend(SnippetPlayingRoute, {
  model: function (params) {
    return this.controllerFor('typing_area').newSnippet();
  }
});
