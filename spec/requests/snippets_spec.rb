require 'rails_helper'

describe "Snippets" do
  describe "GET '/snippets'" do
    before(:each) do
      @cat_a = create(:category)
      @cat_b = create(:category)
      @snippets = [
        create(:snippet, full_text: 'catAsnip1', category: @cat_a),
        create(:snippet, full_text: 'catAsnip2', category: @cat_a),
        create(:snippet, full_text: 'catBsnip1', category: @cat_b),
      ]
    end

    it "shows an index of all snippets" do
      get snippets_path
      response.body.should =~ /catAsnip1.*catAsnip2.*catBsnip1/m
    end

    it "allows category filtering via the category_id parameter" do
      get snippets_path, category_id: @cat_b.id
      response.body.should_not =~ /catA/
    end
  end
end
