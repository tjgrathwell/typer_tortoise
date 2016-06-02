import Ember from 'ember';
import Storage from 'frontend/storage';

export default Ember.Controller.extend({
  session: Ember.inject.controller(),

  actionsCount: function () {
    return (this.get('session.user.admin')) ? 4 : 2;
  }.property('session.user'),

  snippetCategories: function () {
    return this.store.findAll('category');
  }.property(),

  filteredSnippets: function () {
    return this.get('model').filter((snippet) => {
      return snippet.get('categoryId') === parseInt(this.get('categoryId'), 10);
    });
  }.property('model', 'categoryId'),

  saveCategoryId: function () {
    Storage.set('typer_tortoise.filtered_category_id', this.get('categoryId'));
  }.observes('categoryId'),

  actions: {
    destroy(snippet) {
      var answer = confirm('Are you sure?');
      if (answer) {
        snippet.destroyRecord().then(() => {
          this.set('model', this.store.findAll('snippet'));
        });
      }
    },

    categoryChanged(categoryId) {
      this.set('categoryId', categoryId);
    }
  }
});
