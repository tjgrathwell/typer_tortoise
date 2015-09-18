App.models.Category = Ember.Object.extend({
  id: null,
  name: null,
  enabled: null,

  toJson: function () {
    return {id: this.get('id')};
  }
});
