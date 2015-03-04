App.UserRoute = Ember.Route.extend({
  model: function (params) {
    return Ember.$.getJSON('/users/' + params.user_id + '.json');
  },

  setupController: function (controller, model) {
    controller.set('model', model);
  }
});
