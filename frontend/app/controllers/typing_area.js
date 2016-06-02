import Ember from 'ember';
import Utilities from 'frontend/util'
import TypingText from 'frontend/models/typing_text'

export default Ember.Controller.extend({
  category_preferences: Ember.inject.controller(),
  scores: Ember.inject.controller(),
  session: Ember.inject.controller(),

  init: function () {
    this._super();

    this.set('current_snippet', null);
  },

  saveScore: function () {
    var score = this.store.createRecord(
      'score',
      this.get('current_snippet').getScoreAttributes()
    );
    if (this.get('session.user')) {
      score.save();
    }
  },

  changeSnippetToCategory: function (category_ids) {
    if (!this.get('current_snippet')) {
      return;
    }

    if (category_ids.indexOf(this.get('current_snippet.snippet.categoryId')) >= 0) {
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

    var id;
    if (snippet_num) {
      id = snippet_num;
    } else {
      id = 'random';
      if (!this.get('session.user')) {
        params['category_ids'] = this.get('category_preferences').enabledCategoryIds();
      }
    }

    var lastSnippet = this.get('current_snippet') || this.get('previous_snippet');
    if (lastSnippet) {
      params['last_seen'] = lastSnippet.get('snippet.id');
    }

    var promise;
    if (id === 'random') {
      promise = this.store.queryRecord('snippet', Ember.merge(params, {random: true}));
    } else {
      promise = this.store.findRecord('snippet', id);
    }

    return promise.then((snippet) => {
      var typingText = TypingText.create({
        snippet: snippet,
        enableTimer: true
      });
      this.set('current_snippet', typingText);
      return snippet;
    });
  }
});
