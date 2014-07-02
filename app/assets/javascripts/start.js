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
    if ($('#score-display').length == 0) {
      return;
    }

    var wpmDisplay = App.views.WPMDisplay.create({
      container: this.container,
      textBinding: Em.Binding.oneWay('App.typingAreaController.current_snippet')
    });
    wpmDisplay.appendTo('#score-display');

    var typingArea = App.views.TypingArea.create({
      container: this.container,
      textBinding: Em.Binding.oneWay('App.typingAreaController.current_snippet')
    });
    typingArea.appendTo('#typing-area');
    App.set('typingArea', typingArea);

    var accuracyDisplay = App.views.AccuracyDisplay.create({
      container: this.container,
      textBinding: Em.Binding.oneWay('App.typingAreaController.current_snippet')
    });
    accuracyDisplay.appendTo('#score-display');

    var scoreList = App.views.ScoreListView.create({
      container: this.container
    });
    scoreList.appendTo('#user-score-display');
  }
});