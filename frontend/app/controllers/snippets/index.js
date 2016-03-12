import Ember from 'ember';
import Storage from 'frontend/storage';

export default Ember.Controller.extend({
  session: Ember.inject.controller(),

  actionsCount: function () {
    return (this.get('session.user.admin')) ? 4 : 2;
  }.property('session.user'),

  snippetCategories: function () {
    var categories = {};
    this.get('model.snippets').forEach(function (snippet) {
      categories[snippet.category_id] = snippet.category_name;
    });
    return Object.keys(categories).map(function (id) {
      return {name: categories[id], id: id};
    });
  }.property('model.snippets'),

  filteredSnippets: function () {
    return this.get('model.snippets').filter((function (snippet) {
      return snippet.category_id === parseInt(this.get('category_id'), 10);
    }).bind(this));
  }.property('model.snippets', 'category_id'),

  saveCategoryId: function () {
    Storage.set('typer_tortoise.filtered_category_id', this.get('category_id'));
  }.observes('category_id'),

  actions: {
    destroy(snippet) {
      var answer = confirm('Are you sure?');
      if (answer) {
        Ember.$.ajax({
          url: '/snippets/' + snippet.id,
          method: 'DELETE',
          dataType: 'json'
        }).then((function () {
          var snippets = this.get('model.snippets');
          var newSnippets = [];
          snippets.forEach(function (s) {
            if (s.id !== snippet.id) {
              newSnippets.push(s);
            }
          });
          this.set('model.snippets', newSnippets);
        }).bind(this));
      }
    },

    categoryChanged() {
      const selectedEl = $('select');
      const selectedValue = selectedEl.val();
      this.set('category_id', selectedValue);
    }
  }
});
