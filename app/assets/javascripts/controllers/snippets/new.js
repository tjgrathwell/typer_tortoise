App.SnippetsNewController = Ember.ObjectController.extend({
  needs: ['categories'],

  snippetInvalid: function() {
    return !this.get('full_text') || !this.get('category_id');
  }.property('full_text', 'category_id'),

  actions: {
    submitAction : function(){
      Ember.$.ajax({
        type: 'POST',
        url: '/snippets.json',
        data: {
          snippet: {
            full_text: this.get('full_text'),
            category_id: this.get('category_id')
          }
        }
      }).then((function (response) {
        this.transitionToRoute('snippet.index', response.id);
      }).bind(this));
    }
  }
});