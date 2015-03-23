App.SnippetsIndexController = Ember.ObjectController.extend({
  needs: ['session'],

  actionsCount: function () {
    return (this.get('controllers.session.user.admin')) ? 4 : 2;
  }.property('controllers.session.user'),

  snippetCategories: function () {
    var categories = {};
    this.get('model').snippets.forEach(function (snippet) {
      categories[snippet.category_id] = snippet.category_name;
    });
    return Object.keys(categories).map(function (id) {
      return {name: categories[id], id: id};
    });
  }.property('model'),

  filteredSnippets: function () {
    return this.get('model').snippets.filter((function (snippet) {
      return snippet.category_id == this.get('category_id');
    }).bind(this));
  }.property('model', 'category_id'),

  actions: {
    destroy: function(snippet) {
      var answer = confirm('Are you sure?');
      if (answer) {
        Ember.$.ajax({
          url: '/snippets/' + snippet.id + '.json',
          method: 'DELETE'
        }).then((function () {
          // TODO: improve this, by doing basically anything else
          var snippets = this.get('model').snippets;
          var newSnippets = [];
          snippets.forEach(function (s) {
            if (s.id != snippet.id) {
              newSnippets.push(s);
            }
          });
          this.set('model', {snippets: newSnippets});
        }).bind(this));
      }
    }
  }
});