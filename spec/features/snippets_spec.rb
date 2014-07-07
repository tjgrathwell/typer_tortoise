require 'rails_helper'

describe "snippets index" do
  before do
    @cat_a = create(:category)
    @cat_b = create(:category)
    @snippets = [
      create(:snippet, full_text: 'catAsnip1', category: @cat_a),
      create(:snippet, full_text: 'catAsnip2', category: @cat_a),
      create(:snippet, full_text: 'catBsnip1', category: @cat_b),
    ]
  end

  it "shows all the snippets in the database" do
    visit snippets_path
    page.should have_content(/catAsnip1.*catAsnip2.*catBsnip1/m)
  end

  it "allows category filtering via the category_id parameter" do
    visit snippets_path(category_id: @cat_b.id)
    page.should_not have_content('catA')
  end
end
