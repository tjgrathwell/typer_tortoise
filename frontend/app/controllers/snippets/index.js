import Ember from 'ember';
import Storage from 'frontend/storage';

export default Ember.Controller.extend({
  session: Ember.inject.controller(),

  actionsCount: function () {
    return (this.get('session.user.admin')) ? 4 : 2;
  }.property('session.user'),

  snippetCategories: function () {
    var categories = {};
    this.get('model').forEach(function (snippet) {
      categories[snippet.get('categoryId')] = snippet.get('categoryName');
    });
    return Object.keys(categories).map(function (id) {
      return {name: categories[id], id: id};
    });
  }.property('model'),

  filteredSnippets: function () {
    return this.get('model').filter((function (snippet) {
      return snippet.get('categoryId') === parseInt(this.get('categoryId'), 10);
    }).bind(this));
  }.property('model', 'categoryId'),

  saveCategoryId: function () {
    Storage.set('typer_tortoise.filtered_category_id', this.get('categoryId'));
  }.observes('categoryId'),

  actions: {
    destroy(snippet) {
      var answer = confirm('Are you sure?');
      if (answer) {
        Ember.$.ajax({
          url: '/snippets/' + snippet.id,
          method: 'DELETE',
          dataType: 'json'
        }).then((function () {
          var snippets = this.get('model');
          var newSnippets = [];
          snippets.forEach(function (s) {
            if (s.id !== snippet.id) {
              newSnippets.push(s);
            }
          });
          this.set('model', newSnippets);
        }).bind(this));
      }
    },

    categoryChanged() {
      const selectedEl = $('select');
      const selectedValue = selectedEl.val();
      this.set('categoryId', selectedValue);
    }
  }
});
