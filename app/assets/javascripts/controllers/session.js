App.SessionController = Ember.Controller.extend({
  init: function () {
    this.set('user', App.user);
  }
});
