App.SnippetEditController = Ember.ObjectController.extend({
  needs: ['session', 'categories'],

  actions: {
    submitAction : function(){
      var model = this.get("model");
      Ember.$.ajax({
        type: 'PUT',
        url: '/snippets/' + model.get('snippet_id') + '.json',
        data: {
          snippet: {
            full_text: model.get('full_string'),
            category_id: model.get('category_id')
          }
        }
      }).then((function (response) {
        this.transitionToRoute('snippet.index', response.id);
      }).bind(this));
    }
  }
});