App.CategoriesController = Ember.ArrayController.extend({
  init: function () {
    this.set('model', window.snippetCategories);
    this._super();
  }
});
