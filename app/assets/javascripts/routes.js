App.Router.reopen({
  location: 'history'
});

App.Router.map(function() {
  this.resource('snippet', { path: '/snippets/:snippet_id' }, function() {
    this.route('play');
  });
  this.route('catchAll', { path: '*:' });
});
