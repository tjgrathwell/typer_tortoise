import Ember from 'ember';

export default Ember.Controller.extend({
  init: function () {
    this._super();
    this.set('user', window.currentUser);
  }
});
