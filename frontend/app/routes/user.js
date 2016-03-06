import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel: function() {
    if (!this.controllerFor('session').user) {
      this.transitionTo('/');
    }
  },

  model: function (params) {
    return Ember.$.getJSON('/users/' + params.user_id);
  },

  setupController: function (controller, model) {
    controller.set('model', model);
  }
});
