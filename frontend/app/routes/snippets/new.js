import Ember from 'ember';

export default Ember.Route.extend({
  model: function () {
    return Ember.Object.create({
      full_text: '',
      category_id: null
    });
  }
});
