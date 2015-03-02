App.ApplicationRoute = Ember.Route.extend({
  setupController: function (controller) {
    var prefs_link = App.views.PrefsLink.create({
      container: this.container
    });
    prefs_link.replaceIn('#prefs-link-container');
  }
});