App.views.PrefsLink = Em.View.extend({
    templateName: 'prefs-link',
    tagName: 'span',
    classNames: ['prefs-link'],

    click: function () {
        App.get('categoryPrefController').showPreferences();
    }
});

App.views.PrefsSaveButton = Em.View.extend({
    tagName: 'button',
    click: function (e) {
        var pref_controller = App.get('categoryPrefController');
        pref_controller.saveCategories(function () {
            pref_controller.hidePreferences();
            App.get('typingAreaController').changeSnippetToCategory(pref_controller.enabledCategoryIds());
        });
    }
});

App.views.PrefsPopup = Em.View.extend({
    templateName: 'prefs-popup',
    classNames: ['prefs-popup-bg'],

    click: function () {
        this.destroy();
    }
});

App.views.PrefsPopupContent = Em.View.extend({
    classNames: ['blue-round', 'prefs-popup'],

    click: function (e) {
        e.stopPropagation();
    },

    didInsertElement: function () {
        this._super();
        this.$().css({
            left: $('.container').offset().left + 40,
            top: $(window).height() / 4
        });
    }
});