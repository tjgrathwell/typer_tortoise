import Ember from 'ember';

export default Ember.Controller.extend({
  needs: ['session', 'category_preferences'],

  twitterLink: function () {
    return '/auth/twitter?origin=' + encodeURIComponent(this.get('target.url'));
  }.property('target.url')
});
