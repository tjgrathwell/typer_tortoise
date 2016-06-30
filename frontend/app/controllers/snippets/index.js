import Ember from 'ember';
import Storage from 'frontend/storage';

export default Ember.Controller.extend({
  session: Ember.inject.controller(),
  sortColumn: null,
  sortReverse: false,

  actionsCount: function () {
    return (this.get('session.user.admin')) ? 4 : 2;
  }.property('session.user'),

  snippetCategories: function () {
    return this.store.findAll('category');
  }.property(),

  filteredSnippets: function () {
    let unsortedSnippets = this.get('model').filter(snippet => {
      return snippet.get('categoryId') === parseInt(this.get('categoryId'), 10);
    });
    if (!this.get('sortColumn')) {
      return unsortedSnippets;
    } else {
      let sortedSnippets = unsortedSnippets.sortBy(this.get('sortColumn'));
      return this.get('sortReverse') ? sortedSnippets.reverse() : sortedSnippets;
    }
  }.property('model', 'categoryId', 'sortColumn', 'sortReverse'),

  saveCategoryId: function () {
    Storage.set('typer_tortoise.filtered_category_id', this.get('categoryId'));
  }.observes('categoryId'),

  actions: {
    toggleSortColumn (column) {
      if (this.get('sortColumn') === column) {
        this.set('sortReverse', !this.get('sortReverse'));
      } else {
        this.set('sortReverse', false);
      }
      this.set('sortColumn', column);
    },

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
