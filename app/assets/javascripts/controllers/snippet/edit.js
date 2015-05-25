App.SnippetEditController = Ember.Controller.extend({
  needs: ['session', 'categories'],

  snippetInvalid: function () {
    return !this.get('model.full_string') || !this.get('model.category_id');
  }.property('model.full_string', 'model.category_id'),

  actions: {
    submitAction: function () {
      Ember.$.ajax({
        type: 'PUT',
        url: '/snippets/' + this.get('model.snippet_id') + '.json',
        data: {
          snippet: {
            full_text: this.get('model.full_string'),
            category_id: this.get('model.category_id')
          }
        }
      }).then((function (response) {
        this.transitionToRoute('snippet.index', response.id);
      }).bind(this));
    }
  }
});