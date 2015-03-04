App.UsersIndexRoute = Ember.Route.extend({
  model: function () {
    return Ember.$.getJSON('/users.json').then(function (response) {
      // TODO: remove when users are linkable
      response.users.map(function (user) {
        user.user_link = '/users/' + user.id;
      });
      return response;
    });
  },

  setupController: function (controller, model) {
    controller.set('model', model);
  }
});
