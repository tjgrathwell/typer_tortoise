App.UsersIndexRoute = Ember.Route.extend({
  beforeModel: function() {
    if (!this.controllerFor('session').user) {
      this.transitionTo('/');
    }
  },

  model: function () {
    return Ember.$.getJSON('/users');
  },

  setupController: function (controller, model) {
    controller.set('model', model);
  }
});
