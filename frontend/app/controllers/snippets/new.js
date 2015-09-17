import Ember from 'ember';

export default Ember.Controller.extend({
  needs: ['categories'],

  snippetInvalid: function () {
    return !this.get('model.full_text') || !this.get('model.category_id');
  }.property('model.full_text', 'model.category_id'),

  actions: {
    submitAction: function () {
      Ember.$.ajax({
        type: 'POST',
        url: '/snippets',
        data: {
          snippet: {
            full_text: this.get('model.full_text'),
            category_id: this.get('model.category_id')
          }
        },
        dataType: 'json'
      }).then((function (response) {
        this.transitionToRoute('snippet.index', response.id);
      }).bind(this));
    }
  }
});
