App.ApplicationRoute = Ember.Route.extend({
  actions: {
    showPreferences: function () {
      this.controllerFor('category_preferences').loadCategories().then((function () {
        this.render('prefs-popup', {
          into: 'application',
          outlet: 'modal'
        });
      }).bind(this));
    },

    savePreferences: function () {
      var pref_controller = this.controllerFor('category_preferences');
      pref_controller.saveCategories().then((function () {
        this.send('closeModal');
        this.controllerFor('typing_area').changeSnippetToCategory(pref_controller.enabledCategoryIds());
      }).bind(this));
    },

    showCategory: function (categoryId) {
      App.storage.set('typer_tortoise.filtered_category_id', categoryId);
      this.transitionTo('snippets.index');
    },

    closeModal: function () {
      return this.disconnectOutlet({
        outlet: 'modal',
        parentView: 'application'
      });
    }
  }
});