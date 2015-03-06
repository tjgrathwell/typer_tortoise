App.controllers.CategoryPrefController = Em.ArrayController.extend({
    content: [],

    init: function () {
        // if category ids are in local storage, optimistically
        //   load them into 'content' (as just ids, no 'name' attribute)
        //   as if we know they're correct.
        //
        // this is to optimize the initial pageload so we don't have
        //   to load /categories before /snippets/random.
        //
        // hopefully any discontinuities (a user with discontinued
        //   categories in their localStorage prefs) will be cleared
        //   up when that user next saves their prefs.
        if (!App.user && App.storage.supported) {
            var category_ids = App.storage.get('typer_tortoise.category_ids');
            if (category_ids) {
                var categories = category_ids.split(',').map(function (cat_id) {
                    return App.models.Category.create({id: parseInt(cat_id, 10), enabled: true});
                });
                this.set('content', categories);
            }
        }
    },

    findCategoryById: function (category_id) {
        var content = this.get('content');
        var length = content.length;
        for (var i = 0; i < length; i++) {
            if (content[i].get('id') === category_id) {
                return content[i];
            }
        }
        throw "Couldn't find an object with id " + category_id;
    },

    setCategory: function (category_id, enabled) {
        this.findCategoryById(category_id).set('enabled', enabled);
    },

    disableAll: function () {
        this.get('content').forEach(function (category) {
            category.set('enabled', false)
        });
    },

    enabledCategories: function () {
        return this.get('content').filter(function (el) { return el.enabled });
    },

    enabledCategoryIds: function () {
        return this.enabledCategories().map(function (cat) { return cat.get('id') });
    },

    saveCategories: function () {
        var enabledIds = this.enabledCategoryIds();
        if (App.user) {
            return this._saveCategoriesToServer(enabledIds);
        } else {
            return this._saveCategoriesToStorage(enabledIds);
        }
    },

    _saveCategoriesToServer: function (enabledIds) {
        return new Ember.RSVP.Promise(function(resolve, reject) {
            $.post('/categories/set_preferences', {
                categories: enabledIds
            }, function () {
                resolve();
            });
        });
    },

    _saveCategoriesToStorage: function (enabledIds) {
        return new Ember.RSVP.Promise(function(resolve, reject) {
            if (App.storage.supported) {
                App.storage.set('typer_tortoise.category_ids', enabledIds.join(','));
            }

            resolve();
        });
    },

    loadCategories: function () {
        var self = this;
        return new Ember.RSVP.Promise(function (resolve, reject) {
            return self._loadCategoriesFromServer().then(function (json) {
                self.set('content', json.map(function (el) {
                  return App.models.Category.create(el);
                }));
                if (!App.user) {
                    self._loadCategoryPreferencesFromStorage();
                }
                resolve();
            });
        });
    },

    _loadCategoriesFromServer: function () {
        return new Ember.RSVP.Promise(function (resolve, reject) {
            $.get('/categories', function (data) {
                resolve(data);
            });
        });
    },

    _loadCategoryPreferencesFromStorage: function () {
        if (!App.storage.supported) return;

        var category_id_csv = App.storage.get('typer_tortoise.category_ids');
        if (!category_id_csv) return;

        this.disableAll();

        var category_ids = category_id_csv.split(',').map(function (id) { return parseInt(id, 10) });
        category_ids.forEach(function (cat_id) {
            this.setCategory(cat_id, true);
        }, this);
    }
});
