import Storage from 'frontend/storage';
import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    showPreferences: function () {
      this.controllerFor('categoryPreferences').loadCategories().then(() => {
        this.render('prefs-popup', {
          into: 'application',
          outlet: 'modal'
        });
      });
    },

    savePreferences: function () {
      var prefController = this.controllerFor('categoryPreferences');
      prefController.saveCategories().then(() => {
        this.send('closeModal');
        this.controllerFor('typingArea').changeSnippetToCategory(prefController.enabledCategoryIds());
      });
    },

    showCategory: function (categoryId) {
      Storage.set('typer_tortoise.filtered_category_id', categoryId);
      this.transitionTo('snippets.index');
    },

    closeModal: function () {
      this.controllerFor('typingArea').set('refocus', true);
      this.disconnectOutlet({
        outlet: 'modal',
        parentView: 'application'
      });
    }
  }
});
