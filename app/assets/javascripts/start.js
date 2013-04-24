App.isPlaying = function () {
  return (App.history.pageToken() === '/') || App.history.pageToken().match('/play');
};

App.start = function () {
  if (App.user && App.storage.supported) {
    // Kill localStorage prefs every time someone logs in properly.
    App.storage.remove('typer_tortoise.category_ids');
  }

  var prefs_link = App.views.PrefsLink.create({});
  prefs_link.replaceIn('#prefs-link-container');

  if (!App.isPlaying()) return;

  App.set('typingAreaController', App.controllers.TypingAreaController.create({}));

  App.set('categoryPrefController',  App.controllers.CategoryPrefController.create({}));

  $(document).bind('keyPress keyDown', function (e) {
    App.setPreventDefaultForKey(e);
  });

  var typingArea = App.views.TypingArea.create({
    textBinding: Em.Binding.oneWay('App.typingAreaController.current_snippet')
  });
  typingArea.appendTo('#typing-area');
  App.set('typingArea', typingArea);

  var wpmDisplay = App.views.WPMDisplay.create({
    textBinding: Em.Binding.oneWay('App.typingAreaController.current_snippet')
  });
  wpmDisplay.appendTo('#score-display');

  var accuracyDisplay = App.views.AccuracyDisplay.create({
    textBinding: Em.Binding.oneWay('App.typingAreaController.current_snippet')
  });
  accuracyDisplay.appendTo('#score-display');

  var scoreList = App.views.ScoreListView.create({});
  scoreList.appendTo('#user-score-display');

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