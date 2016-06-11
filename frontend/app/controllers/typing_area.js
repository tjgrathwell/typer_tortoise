import Ember from 'ember';
import Utilities from 'frontend/util'
import TypingText from 'frontend/models/typing_text'

export default Ember.Controller.extend({
  categoryPreferences: Ember.inject.controller(),
  scores: Ember.inject.controller(),
  session: Ember.inject.controller(),

  init: function () {
    this._super();

    this.set('currentSnippet', null);
  },

  saveScore: function () {
    var score = this.store.createRecord(
      'score',
      this.get('currentSnippet').getScoreAttributes()
    );
    if (this.get('session.user')) {
      score.save();
    }
  },

  changeSnippetToCategory: function (categoryIds) {
    if (!this.get('currentSnippet')) {
      return;
    }

    if (categoryIds.indexOf(this.get('currentSnippet.snippet.categoryId')) >= 0) {
      // if this snippet is already in the whitelist of categories, nothing to do
      return;
    }

    this.newSnippet();
  },

  clearSnippet: function () {
    this.set('previousSnippet', this.get('currentSnippet'));
    this.set('currentSnippet', null);
  },

  newSnippet: function (snippetNum) {
    var params = {};

    var id;
    if (snippetNum) {
      id = snippetNum;
    } else {
      id = 'random';
      if (!this.get('session.user')) {
        params['category_ids'] = this.get('categoryPreferences').enabledCategoryIds();
      }
    }

    var lastSnippet = this.get('currentSnippet') || this.get('previousSnippet');
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
      this.set('currentSnippet', typingText);
      return snippet;
    });
  }
});
