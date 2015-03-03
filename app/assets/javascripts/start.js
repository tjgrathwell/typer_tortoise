App.isPlaying = function () {
  return (App.history.pageToken() === '/') || App.history.pageToken().match('/play');
};

App.start = function () {
  if (App.user && App.storage.supported) {
    // Kill localStorage prefs every time someone logs in properly.
    App.storage.remove('typer_tortoise.category_ids');
  }

  App.set('categoryPrefController', App.controllers.CategoryPrefController.create({}));

  App.set('typingAreaController', App.controllers.TypingAreaController.create({}));

  App.set('scoresController', App.controllers.ScoresController.create({}));

  if (App.isPlaying() || App.history.pageToken().match(/snippets\/\d+$/)) {
    App.get('scoresController').loadScores();
  }

  if (!App.isPlaying()) return;

  $(document).bind('keyPress keyDown', function (e) {
    App.setPreventDefaultForKey(e);
  });
};
