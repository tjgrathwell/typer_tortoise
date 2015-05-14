describe("category preferences controller", function () {
  var categories_json = [
    {id: 1, name: 'melodramatically-din',   enabled: false},
    {id: 2, name: 'warrant-individualists', enabled: true},
    {id: 3, name: 'overlaid-arachnids',     enabled: true}
  ];

  describe('when initialized with some categories', function () {
    var catController;

    beforeEach(function () {
      catController = App.CategoryPreferencesController.create({});
      catController.set('model', $.map(categories_json, function (el) {
        return App.models.Category.create(el);
      }));
    });

    it('allows you to ask for just the enabled categories', function () {
      expect(catController.enabledCategoryIds()).toEqual([2, 3]);
    });

    it('allows you to toggle categories on and off', function () {
      catController.setCategory(2, false);
      expect(catController.enabledCategoryIds()).toEqual([3]);
    });

    it('whines when you try to toggle a category it does not know', function () {
      expect(function () {
        catController.setCategory(4, false);
      }).toThrow("Couldn't find an object with id 4");
    });
  });

  describe("for a user that hasn't logged in", function () {
    var storage_key_name = 'typer_tortoise.category_ids';

    beforeEach(function () {
      App.storage.clear();
    });

    it('loads the selected categories from localstorage if available', function (finish) {
      var catController = App.CategoryPreferencesController.create();

      var categoriesPromise = new Ember.RSVP.Promise(function (resolve, reject) {
        resolve(categories_json);
      });
      spyOn(catController, '_loadCategoriesFromServer').and.returnValue(categoriesPromise);

      expect(catController.enabledCategoryIds()).toEqual([]);

      App.storage.set(storage_key_name, '1,3');
      var requiredExpect = jasmine.createRequiredExpect();
      catController.loadCategories().then(function () {
        requiredExpect(catController.enabledCategoryIds()).toEqual([1,3]);
        finish();
      });
    });

    it('saves the selected categories into localstorage as csv', function () {
      var catController = App.CategoryPreferencesController.create();

      catController.set('model', $.map(categories_json, function (el) {
        return App.models.Category.create(el);
      }));

      catController.saveCategories(function () {});

      expect(App.storage.get(storage_key_name)).toEqual('2,3');
    });

    it('optimistically creates category objects from localStorage on init', function () {
      App.storage.set(storage_key_name, '35,93');

      var catController = App.CategoryPreferencesController.create();
      expect(catController.enabledCategoryIds()).toEqual([35, 93]);
    });
  });
});
