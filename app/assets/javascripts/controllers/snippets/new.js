App.SnippetsNewController = Ember.ObjectController.extend({
  actions: {
    submitAction : function(){
      var model = this.get("model");
      Ember.$.ajax({
        type: 'POST',
        url: '/snippets.json',
        data: {
          snippet: {
            full_text: model.get('full_text'),
            category_id: model.get('category_id')
          }
        }
      }).then((function (response) {
        this.transitionToRoute('snippet.index', response.id);
      }).bind(this));
    }
  }
});