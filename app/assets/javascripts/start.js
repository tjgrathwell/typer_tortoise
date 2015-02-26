App.isPlaying = function () {
  return (App.history.pageToken() === '/') || App.history.pageToken().match('/play');
};

App.start = function () {
  if (App.user && App.storage.supported) {
    // Kill localStorage prefs every time someone logs in properly.
    App.storage.remove('typer_tortoise.category_ids');
  }

  App.set('categoryPrefController', App.controllers.CategoryPrefController.create({}));

  if (!App.isPlaying()) return;

  App.set('typingAreaController', App.controllers.TypingAreaController.create({}));

  $(document).bind('keyPress keyDown', function (e) {
    App.setPreventDefaultForKey(e);
  });

  App.set('scoresController', App.controllers.ScoresController.create({}));

  App.get('scoresController').loadScores();
};

App.ApplicationRoute = Ember.Route.extend({
  setupController: function (controller) {
    var prefs_link = App.views.PrefsLink.create({
      container: this.container
    });
    prefs_link.replaceIn('#prefs-link-container');
  }
});

App.Router.reopen({
  location: 'history'
});

App.Router.map(function() {
  this.resource('snippet', { path: '/snippets/:snippet_id' }, function() {
    this.route('play');
  });
  this.route('catchAll', { path: '*:' });
});

App.IndexRoute = App.SnippetRoute = Ember.Route.extend({
  model: function (params) {
    // TODO: This is done more for the side-effect than to return a 'model'.
    App.get('typingAreaController').newSnippet(params.snippet_id);
  },

  renderTemplate: function () {
    this.render('snippet/play');
  }
});