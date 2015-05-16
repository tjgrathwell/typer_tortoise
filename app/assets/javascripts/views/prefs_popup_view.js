App.PrefsPopupBackgroundView = Em.View.extend({
    classNames: ['prefs-popup-bg'],

    click: function () {
        this.get('controller').send('closeModal');
    }
});

App.PrefsPopupContentView = Em.View.extend({
    classNames: ['blue-round', 'prefs-popup'],
    // TODO: this doesn't work, make it work!
    userBinding: Em.Binding.oneWay('controllers.session.user'),

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