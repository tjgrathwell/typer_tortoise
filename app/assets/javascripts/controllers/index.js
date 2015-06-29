App.IndexController = Ember.Controller.extend(App.SnippetPlayingController, {
  isActive: Ember.computed.equal('controllers.application.currentRouteName', 'index')
});