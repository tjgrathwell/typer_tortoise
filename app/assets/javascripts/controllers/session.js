App.SessionController = Ember.Controller.extend({
  init: function () {
    this._super();
    this.set('user', App.user);
  }
});
