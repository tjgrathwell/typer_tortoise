App.CategoriesController = Ember.ArrayController.extend({
  init: function () {
    this._super();
    Ember.$.get('/categories.json', (function(data) {
      this.set('model', data);
    }).bind(this));
  }
});
