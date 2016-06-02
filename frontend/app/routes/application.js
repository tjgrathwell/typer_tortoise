import Storage from 'frontend/storage';
import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    showPreferences: function () {
      this.controllerFor('category_preferences').loadCategories().then(() => {
        this.render('prefs-popup', {
          into: 'application',
          outlet: 'modal'
        });
      });
    },

    savePreferences: function () {
      var pref_controller = this.controllerFor('category_preferences');
      pref_controller.saveCategories().then(() => {
        this.send('closeModal');
        this.controllerFor('typing_area').changeSnippetToCategory(pref_controller.enabledCategoryIds());
      });
    },

    showCategory: function (categoryId) {
      Storage.set('typer_tortoise.filtered_category_id', categoryId);
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
