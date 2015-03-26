App.TypingAreaController = Em.ObjectController.extend({
    needs: ['category_preferences', 'scores'],

    init: function () {
        this._super();

        this.set('current_snippet', null);
        // TODO: Stop doing this after figuring out how TypingAreaView knows where the snippet is
        App.set('typingAreaController', this);
    },

    saveScore: function () {
        var score = this.get('current_snippet').getScore();
        this.get('controllers.scores').add(score);
        if (App.user) {
          $.post('/scores', {score: score.toJson()});
        }
    },

    changeSnippetToCategory: function (category_ids) {
        if (!this.get('current_snippet')) return;

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
            url = '/snippets/' + snippet_num + '.json';
        } else {
            url = '/snippets/random.json';
            if (!App.user) {
                params['category_ids'] = this.get('controllers.category_preferences').enabledCategoryIds();
            }
        }

        var lastSnippet = this.get('current_snippet') || this.get('previous_snippet');
        if (lastSnippet) {
            params['last_seen'] = lastSnippet.get('snippet_id');
        }

        return Ember.$.getJSON(url, params).then((function (snippet_json) {
            var snippet = App.models.TypingText.create({
                full_string: App.util.chomp(snippet_json['full_text']),
                snippet_id: snippet_json['id'],
                category_id: snippet_json['category_id'],
                category_name: snippet_json['category_name'],
                scores: snippet_json['scores']
            });
            this.set('current_snippet', snippet);
            return snippet;
        }).bind(this));
    }
});
