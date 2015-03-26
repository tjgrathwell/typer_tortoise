App.models.Score = Em.Object.extend({
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