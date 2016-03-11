import Ember from 'ember';

export default Ember.Controller.extend({
  session: Ember.inject.controller(),
  category_preferences: Ember.inject.controller(),

  twitterLink: function () {
    return '/auth/twitter?origin=' + encodeURIComponent(this.get('target.url'));
  }.property('target.url')
});
