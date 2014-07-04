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

  var path = App.history.pageToken();
  if (path.match('/play')) {
    var snippet_num = path.match('/snippets/(\\d+)/play')[1];
    App.get('typingAreaController').newSnippet(snippet_num);
  } else {
    App.get('typingAreaController').newSnippet();
  }

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

App.IndexRoute = Ember.Route.extend({
  setupController: function (controller) {
    if ($('#typing-area-container').length == 0) {
      return;
    }

    var typingAreaContainer = App.views.TypingAreaContainer.create({
      container: this.container
    });
    typingAreaContainer.appendTo('#typing-area-container');
  }
});