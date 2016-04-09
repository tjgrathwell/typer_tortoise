import Storage from 'frontend/storage';
import Ember from 'ember';

export default Ember.Route.extend({
  model: function () {
    return this.store.findAll('snippet');
  },

  setupController: function (controller, model) {
    controller.set('model', model);
    controller.set('categoryId', Storage.get('typer_tortoise.filtered_category_id'));
  }
});
