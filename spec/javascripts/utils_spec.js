describe("repeat", function () {
  it("calls a function (first arg) some number (second arg) of times", function () {
    var counter = 1;
    App.util.repeat(function () { counter++ }, 5);

    expect(counter).toEqual(1 + 5);
  });

  it("takes 'this' as an optional third argument", function () {
    var obj = {counter: 3};
    App.util.repeat(function () { this.counter++ }, 4, obj);

    expect(obj.counter).toEqual(3 + 4);
  });
});
