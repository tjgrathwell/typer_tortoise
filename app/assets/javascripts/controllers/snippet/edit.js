App.SnippetEditController = Ember.ObjectController.extend({
  needs: ['session', 'categories'],

  snippetInvalid: function() {
    return !this.get('full_string') || !this.get('category_id');
  }.property('full_string', 'category_id'),

  actions: {
    submitAction : function(){
      Ember.$.ajax({
        type: 'PUT',
        url: '/snippets/' + this.get('snippet_id') + '.json',
        data: {
          snippet: {
            full_text: this.get('full_string'),
            category_id: this.get('category_id')
          }
        }
      }).then((function (response) {
        this.transitionToRoute('snippet.index', response.id);
      }).bind(this));
    }
  }
});