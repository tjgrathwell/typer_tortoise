require 'rails_helper'

describe "snippets index", js: true do
  before do
    @cat_a = create(:category)
    @cat_b = create(:category)
    @snippets = [
      create(:snippet, full_text: 'catAsnip1', category: @cat_a),
      create(:snippet, full_text: 'catAsnip2', category: @cat_a),
      create(:snippet, full_text: 'catBsnip1', category: @cat_b)
    ]
  end

  it "shows all the snippets in the database" do
    visit '/snippets'
    select @cat_a.name
    expect(page).to have_content(/catAsnip1.*catAsnip2/m)

    select @cat_b.name
    expect(page).to have_content(/catBsnip/m)
  end
end

describe "as a signed-in user" do
  before do
    create(:snippet) # needed for something to render after auth redirect
    sign_in_with_twitter_as(create(:user))
  end

  describe "snippets show page", js: true do
    before do
      @snippet = create(:snippet, full_text: 'sandySnippet')
      user = create(:user, name: 'Svangaard')
      create(:score, snippet: @snippet, user: user, wpm: 65, accuracy: 78.1)
    end

    it "shows snippet information with scores" do
      visit "/snippets/#{@snippet.id}"
      expect(page).to have_content(/sandySnippet/m)

      within '.user-scores' do
        expect(page).to have_content 'Svangaard'
        expect(page).to have_content '65'
        expect(page).to have_content '78.1'
      end
    end
  end

  describe "snippets play page", js: true do
    before do
      @cat_a = create(:category, name: 'CategoryA')
      @cat_b = create(:category, name: 'CategoryB')
      @snippets = [
        create(:snippet, full_text: 'catAsnip1', category: @cat_a),
        create(:snippet, full_text: 'catAsnip2', category: @cat_a),
        create(:snippet, full_text: 'catBsnip1', category: @cat_b)
      ]
    end

    it 'contains a link to show just snippets of that category' do
      visit "/snippets/#{@snippets.first.id}/play"
      expect(page).to have_content(/catAsnip1/m)

      page.find('.type-area-category').click

      expect(page).to have_content(/catAsnip2/m)
      expect(page).to have_content(/catAsnip1/m)
      expect(page).to have_no_content(/catBsnip1/m)
    end
  end
end

context 'as an admin', js: true do
  let!(:snippet) { create(:snippet, full_text: 'hello world') }

  before do
    admin_user = create(:user, is_admin: true)
    sign_in_with_twitter_as(admin_user)
    expect(page).to have_content(snippet.full_text)
  end

  describe "destroying a snippet" do
    it 'removes the snippet from the database' do
      visit "/snippets"

      select snippet.category.name
      expect(page).to have_content(snippet.full_text)

      expect {
        click_on "Destroy"
        expect(page).not_to have_content(snippet.full_text)
      }.to change(Snippet, :count).by(-1)
    end
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
          expect(page).to have_content 'interesting code'
        end
      }.to change(Snippet, :count).by(1)

      expect(Snippet.last.full_text).to eq('interesting code')
    end
  end

  describe "editing a snippet" do
    it 'changes the text of the snippet' do
      visit "/snippets/#{snippet.id}/edit"

      fill_in 'snippet[full_text]', with: 'interesting code'
      click_on 'Update Snippet'
      within 'pre' do
        expect(page).to have_content 'interesting code'
      end

      expect(snippet.reload.full_text).to eq('interesting code')
    end
  end
end
