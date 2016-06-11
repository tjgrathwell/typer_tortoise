import Ember from 'ember';

export default Ember.Mixin.create({
  renderTemplate: function () {
    this.render('snippet/play');
  },

  actions: {
    willTransition: function () {
      return this.controllerFor('typingArea').clearSnippet();
    }
  }
});
