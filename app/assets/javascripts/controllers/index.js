App.IndexController = App.SnippetPlayController.extend({
  isActive: Ember.computed.equal('controllers.application.currentRouteName', 'index')
});