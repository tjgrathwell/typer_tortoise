App.CategoriesController = Ember.ArrayController.create({});

Ember.$.get('/categories.json', function(data) {
  App.CategoriesController.set('model', data);
});