App.SnippetPlayingRoute = Ember.Mixin.create({
  renderTemplate: function () {
    this.render('snippet/play');
  },

  actions: {
    willTransition: function () {
      return this.controllerFor('typing_area').clearSnippet();
    }
  }
});