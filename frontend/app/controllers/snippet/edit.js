import Ember from 'ember';

export default Ember.Controller.extend({
  categories: Ember.inject.controller(),

  snippetInvalid: function () {
    return !this.get('model.fullText') || !this.get('model.categoryId');
  }.property('model.fullText', 'model.categoryId'),

  actions: {
    submitAction() {
      Ember.$.ajax({
        type: 'PUT',
        url: '/snippets/' + this.get('model.id'),
        data: {
          snippet: {
            full_text: this.get('model.fullText'),
            category_id: this.get('model.categoryId')
          }
        },
        dataType: 'json'
      }).then((function (response) {
        this.model.reload();
        this.transitionToRoute('snippet.index', response.id);
      }).bind(this));
    },

    categoryChanged(categoryId) {
      this.set('model.categoryId', categoryId);
    }
  }
});
