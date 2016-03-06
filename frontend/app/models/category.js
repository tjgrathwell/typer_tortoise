import Ember from 'ember'

export default Ember.Object.extend({
  id: null,
  name: null,
  enabled: null,

  toJson: function () {
    return {id: this.get('id')};
  }
});
