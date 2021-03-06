import Ember from 'ember';
import Storage from 'frontend/storage'
import LegacyCategory from 'frontend/models/legacy_category'

export default Ember.Controller.extend({
  session: Ember.inject.controller(),

  init: function () {
    this._super();
    this.set('model', []);

    if (this.get('session.user') && Storage.supported) {
      // Kill localStorage prefs every time someone logs in properly.
      Storage.remove('typer_tortoise.category_ids');
    }

    // if category ids are in local storage, optimistically
    //   load them into 'model' (as just ids, no 'name' attribute)
    //   as if we know they're correct.
    //
    // this is to optimize the initial pageload so we don't have
    //   to load /categories before /snippets/random.
    //
    // hopefully any discontinuities (a user with discontinued
    //   categories in their localStorage prefs) will be cleared
    //   up when that user next saves their prefs.
    if (!this.get('session.user') && Storage.supported) {
      var categoryIds = Storage.get('typer_tortoise.category_ids');
      if (categoryIds) {
        var categories = categoryIds.split(',').map(categoryId => {
          return LegacyCategory.create({
            id: categoryId,
            enabled: true
          });
        });
        this.set('model', categories);
      }
    }
  },

  noCategoriesSelected: function () {
    return this.enabledCategories().length === 0;
  }.property('model.@each.enabled'),

  findCategoryById: function (categoryId) {
    var category = this.get('model').findBy('id', categoryId.toString());
    if (!category) {
      throw new Error("Couldn't find an object with id " + categoryId);
    }
    return category;
  },

  setCategory: function (categoryId, enabled) {
    this.findCategoryById(categoryId).set('enabled', enabled);
  },

  disableAll: function () {
    this.get('model').forEach(function (category) {
      category.set('enabled', false)
    });
  },

  enabledCategories: function () {
    return this.get('model').filterBy('enabled', true);
  },

  enabledCategoryIds: function () {
    return this.enabledCategories().map(cat => parseInt(cat.get('id'), 10))
  },

  saveCategories: function () {
    var enabledIds = this.enabledCategoryIds();
    if (this.get('session.user')) {
      return this._saveCategoriesToServer(enabledIds);
    } else {
      return this._saveCategoriesToStorage(enabledIds);
    }
  },

  _saveCategoriesToServer: function (enabledIds) {
    return new Ember.RSVP.Promise(function (resolve, reject) {
      Ember.$.ajax({
        type: 'POST',
        url: '/categories/set_preferences',
        data: {
          categories: enabledIds
        },
        dataType: 'json'
      }).then(resolve);
    });
  },

  _saveCategoriesToStorage: function (enabledIds) {
    return new Ember.RSVP.Promise(function (resolve, reject) {
      if (Storage.supported) {
        Storage.set('typer_tortoise.category_ids', enabledIds.join(','));
      }

      resolve();
    });
  },

  loadCategories: function () {
    return new Ember.RSVP.Promise((resolve, reject) => {
      return this._loadCategoriesFromServer().then((categories) => {
        this.set('model', categories);
        if (!this.get('session.user')) {
          this._loadCategoryPreferencesFromStorage();
        }
        resolve();
      });
    });
  },

  _loadCategoriesFromServer: function () {
    return this.store.findAll('category');
  },

  _loadCategoryPreferencesFromStorage: function () {
    if (!Storage.supported) {
      return;
    }

    var categoryIdCsv = Storage.get('typer_tortoise.category_ids');
    if (!categoryIdCsv) {
      return;
    }

    this.disableAll();

    var category_ids = categoryIdCsv.split(',');
    category_ids.forEach(function (categoryId) {
      this.setCategory(categoryId, true);
    }, this);
  }
});
