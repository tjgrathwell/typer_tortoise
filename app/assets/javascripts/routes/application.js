App.ApplicationRoute = Ember.Route.extend({
  actions: {
    showPreferences: function () {
      App.get('categoryPrefController').loadCategories().then((function () {
        this.render('prefs-popup', {
          into: 'application',
          outlet: 'modal'
        });
      }).bind(this));
    },

    savePreferences: function () {
      var pref_controller = App.get('categoryPrefController');
      pref_controller.saveCategories().then((function () {
        this.send('closeModal');
        var typingAreaController = App.get('typingAreaController');
        if (typingAreaController) {
          typingAreaController.changeSnippetToCategory(pref_controller.enabledCategoryIds());
        }
      }).bind(this));
    },

    closeModal: function() {
      return this.disconnectOutlet({
        outlet: 'modal',
        parentView: 'application'
      });
    }
  }
});