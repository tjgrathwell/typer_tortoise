import Ember from 'ember';

export default Ember.Component.extend({
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