import Ember from 'ember';

export default Ember.Controller.extend({
  categories: Ember.inject.controller(),

  snippetInvalid: function () {
    return !this.get('model.fullText') || !this.get('model.categoryId');
  }.property('model.fullText', 'model.categoryId'),

  actions: {
    submitAction() {
      this.get('model').save().then((response) => {
        this.transitionToRoute('snippet.index', response.id);
      });
    },

    categoryChanged(categoryId) {
      this.set('model.categoryId', categoryId);
    }
  }
});
