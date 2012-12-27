App.isPlaying = function () {
  return (App.history.pageToken() === '/') || App.history.pageToken().match('/play');
};

App.start = function () {
  if (App.user && App.storage.supported) {
    // Kill localStorage prefs every time someone logs in properly.
    App.storage.remove('typer_tortoise.category_ids');
  }

  var prefs_link = App.prefsLink.create({});
  prefs_link.replaceIn('#prefs-link-container');

  if (!App.isPlaying()) return;

  App.set('categoryPrefController',  App.CategoryPrefController.create({}));

  $(document).bind('keyPress keyDown', function (e) {
    App.setPreventDefaultForKey(e);
  });

  App.TypingArea.appendTo('#typing-area');
  App.WPMDisplay.appendTo('#score-display');
  App.AccuracyDisplay.appendTo('#score-display');
  App.ScoreListView.appendTo('#user-score-display');

  var path = App.history.pageToken();
  if (path.match('/play')) {
    var snippet_num = path.match('/snippets/(\\d+)/play')[1];
    App.typingAreaController.newSnippet(snippet_num);
  } else {
    App.typingAreaController.newSnippet();
  }

  App.scoresController.loadScores();
};