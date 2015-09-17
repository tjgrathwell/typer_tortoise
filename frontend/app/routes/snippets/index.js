import Storage from 'frontend/storage';
import Ember from 'ember';

export default Ember.Route.extend({
  model: function () {
    return Ember.$.getJSON('/snippets');
  },

  setupController: function (controller, model) {
    controller.set('model', model);
    controller.set('category_id', Storage.get('typer_tortoise.filtered_category_id'));
  }
});
