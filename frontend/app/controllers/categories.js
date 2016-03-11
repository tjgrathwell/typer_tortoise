import Ember from 'ember';

export default Ember.Controller.extend({
  init: function () {
    this.set('model', window.snippetCategories);
    this._super();
  }
});
