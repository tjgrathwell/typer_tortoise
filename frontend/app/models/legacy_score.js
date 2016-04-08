import Ember from 'ember';

// TODO: remove this model when all score usage is ember-data'd

export default Ember.Object.extend({
  wpm: null,
  accuracy: null,
  snippet_id: null,

  toJson: function () {
    return {
      snippet_id: this.get('snippet_id'),
      wpm: this.get('wpm'),
      accuracy: this.get('accuracy')
    }
  }
});
