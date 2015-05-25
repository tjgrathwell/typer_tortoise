App.models.Category = Em.Object.extend({
  id: null,
  name: null,
  enabled: null,

  toJson: function () {
    return {id: this.get('id')};
  }
});
