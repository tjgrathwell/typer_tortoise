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

context 'as an admin', js: true do
  let!(:snippet) { create(:snippet, full_text: 'hello world') }

  before do
    admin_user = create(:user, is_admin: true)
    Identity.create(
      user_id: admin_user.id,
      provider: 'twitter',
      uid: '12345'
    )

    OmniAuth.config.test_mode = true
    OmniAuth.config.add_mock(:twitter, {uid: '12345'})

    visit '/auth/twitter'
    page.should have_content(snippet.full_text)
  end

  describe "creating a snippet" do
    let!(:category) { create(:category) }

    it 'adds the snippet to the database' do
      visit "/snippets/new"

      select category.name, from: 'Category'
      fill_in 'snippet[full_text]', with: 'interesting code'
      expect {
        click_on 'Create Snippet'
        within 'pre' do
          page.should have_content 'interesting code'
        end
      }.to change(Snippet, :count).by(1)

      Snippet.last.full_text.should == 'interesting code'
    end
  end

  describe "editing a snippet" do
    it 'changes the text of the snippet' do
      visit "/snippets/#{snippet.id}/edit"

      fill_in 'snippet[full_text]', with: 'interesting code'
      click_on 'Update Snippet'
      within 'pre' do
        page.should have_content 'interesting code'
      end

      snippet.reload.full_text.should == 'interesting code'
    end
  end
end
