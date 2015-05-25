App.Router.reopen({
  location: 'history'
});

App.Router.map(function () {
  this.resource('users', function () {});
  this.resource('user', {path: '/users/:user_id'}, function () {});
  this.resource('snippets', function () {
    this.route('new');
  });
  this.resource('snippet', {path: '/snippets/:snippet_id'}, function () {
    this.route('play');
    this.route('edit');
  });
  this.route('catchAll', {path: '*:'});
});
