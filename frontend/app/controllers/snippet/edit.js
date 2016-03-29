import Ember from 'ember';

export default Ember.Controller.extend({
  session: Ember.inject.controller(),
  categories: Ember.inject.controller(),

  snippetInvalid: function () {
    return !this.get('model.full_string') || !this.get('model.category_id');
  }.property('model.full_string', 'model.category_id'),

  actions: {
    submitAction() {
      Ember.$.ajax({
        type: 'PUT',
        url: '/snippets/' + this.get('model.snippet_id'),
        data: {
          snippet: {
            full_text: this.get('model.full_string'),
            category_id: this.get('model.category_id')
          }
        },
        dataType: 'json'
      }).then((function (response) {
        // TODO: the category doesn't appear changed when saved, but does upon reload
        this.transitionToRoute('snippet.index', response.id);
      }).bind(this));
    },

    categoryChanged(categoryId) {
      this.set('model.category_id', categoryId);
    }
  }
});
