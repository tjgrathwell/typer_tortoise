import Ember from 'ember';
import Utilities from 'frontend/util'
import TypingText from 'frontend/models/typing_text'

export default Ember.Controller.extend({
  needs: ['category_preferences', 'scores', 'session'],

  init: function () {
    this._super();

    this.set('current_snippet', null);
  },

  saveScore: function () {
    var score = this.get('current_snippet').getScore();
    this.get('controllers.scores').add(score);
    if (this.get('controllers.session.user')) {
      Ember.$.ajax({
        type: 'POST',
        url: '/scores',
        data: {score: score.toJson()},
        dataType: 'json'
      });
    }
  },

  changeSnippetToCategory: function (category_ids) {
    if (!this.get('current_snippet')) {
      return;
    }

    if (category_ids.indexOf(this.get('current_snippet').get('category_id')) >= 0) {
      // if this snippet is already in the whitelist of categories, nothing to do
      return;
    }

    this.newSnippet();
  },

  clearSnippet: function () {
    this.set('previous_snippet', this.get('current_snippet'));
    this.set('current_snippet', null);
  },

  newSnippet: function (snippet_num) {
    var params = {};

    var url;
    if (snippet_num) {
      url = '/snippets/' + snippet_num;
    } else {
      url = '/snippets/random';
      if (!this.get('controllers.session.user')) {
        params['category_ids'] = this.get('controllers.category_preferences').enabledCategoryIds();
      }
    }

    var lastSnippet = this.get('current_snippet') || this.get('previous_snippet');
    if (lastSnippet) {
      params['last_seen'] = lastSnippet.get('snippet_id');
    }

    return Ember.$.getJSON(url, params).then((function (snippet_json) {
      var snippet = TypingText.create({
        full_string: Utilities.chomp(snippet_json['full_text']),
        snippet_id: snippet_json['id'],
        category_id: snippet_json['category_id'],
        category_name: snippet_json['category_name'],
        scores: snippet_json['scores'],
        enableTimer: true
      });
      this.set('current_snippet', snippet);
      return snippet;
    }).bind(this));
  }
});
