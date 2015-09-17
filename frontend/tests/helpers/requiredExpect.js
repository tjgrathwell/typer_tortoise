(function () {
  var requiredExpectsPending;

  jasmine.createRequiredExpect = function () {
    requiredExpectsPending += 1;
    return function () {
      requiredExpectsPending -= 1;
      return expect.apply(this, arguments);
    };
  };

  beforeEach(function () {
    requiredExpectsPending = 0;
  });

  afterEach(function () {
    if (requiredExpectsPending > 0) {
      throw Error('A required expect did not execute!');
    }
  });
})();