describe("indentation guessing", function() {
  it("should be able to guess the level of indentation", function() {
    var two = "this is a fake\n  code snippet\n  with indendation\n    that should be two spaces";
    var three = "this is a crazy\n   code snippet\n      with three\n   line indentation";
    var four = "four spaces\n    is an okay number\n    for a program\n        to have";

    var two_text = App.TypingText.create({full_string: two, snippet_id: 1});
    var three_text = App.TypingText.create({full_string: three, snippet_id: 1});
    var four_text = App.TypingText.create({full_string: four, snippet_id: 1});

    expect(two_text._tabSize()).toEqual(2);
    expect(three_text._tabSize()).toEqual(3);
    expect(four_text._tabSize()).toEqual(4);
  });
});
