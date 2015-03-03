App.SnippetsNewRoute = Ember.Route.extend({
  model: function () {
    return Ember.Object.create({
      full_text: '',
      category_id: null
    });
  }
});