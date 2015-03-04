App.UsersIndexRoute = Ember.Route.extend({
  model: function () {
    return Ember.$.getJSON('/users.json');
  },

  setupController: function (controller, model) {
    controller.set('model', model);
  }
});
