App.controllers.TypingAreaController = Em.Object.extend({
    init: function () {
        this.set('current_snippet', null);
    },

    saveScore: function () {
        App.get('scoresController').add(this.get('current_snippet').getScore());
        if (App.user) {
          $.post('/scores', {score: this.get('current_snippet').getScore()});
        }
    },

    changeSnippetToCategory: function (category_ids) {
        if (!App.isPlaying()) return;

        if (category_ids.indexOf(this.get('current_snippet').get('category_id')) >= 0) {
            // if this snippet is already in the whitelist of categories, nothing to do
            return;
        }

        this.newSnippet();
    },

    newSnippet: function (snippet_num) {
        var params = {};

        var url;
        if (snippet_num) {
            url = '/snippets/' + snippet_num + '.json';
        } else {
            url = '/snippets/random.json';
            if (!App.user) {
                params['category_ids'] = App.get('categoryPrefController').enabledCategoryIds();
            }
        }

        if (this.get('current_snippet')) {
            params['last_seen'] = this.get('current_snippet').get('snippet_id');
        }

        return Ember.$.getJSON(url, params).then((function (snippet_json) {
            var snippet = App.models.TypingText.create({
                full_string: App.util.chomp(snippet_json['full_text']),
                snippet_id: snippet_json['id'],
                category_id: snippet_json['category_id']
            });
            this.set('current_snippet', snippet);
            return snippet;
        }).bind(this));
    }
});
