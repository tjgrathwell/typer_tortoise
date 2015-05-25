App.PrefsPopupBackgroundView = Em.View.extend({
  classNames: ['prefs-popup-bg'],

  click: function () {
    this.get('controller').send('closeModal');
  }
});

App.PrefsPopupContentView = Em.View.extend({
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