import Ember from 'ember';

export default Ember.ArrayController.extend({
  init: function () {
    this.set('model', window.snippetCategories);
    this._super();
  }
});
