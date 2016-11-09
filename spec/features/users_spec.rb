require 'rails_helper'

describe "users", js: true do
  before do
    @user1 = create(:user)
    @user2 = create(:user)
    create(:snippet, full_text: 'HelloWorld')
  end

  describe "as an unauthenticated user" do
    it "redirects the user list to the home page" do
      visit '/users'
      expect(page).to have_content('HelloWorld')
    end

    it "redirects individual user pages to the home page" do
      visit "/users/#{@user1.id}"
      expect(page).to have_content('HelloWorld')
    end
  end

  describe "as an authenticated user" do
    before do
      sign_in_with_twitter_as(@user1)
    end

    describe "index" do
      it "shows a list of users" do
        visit '/users'
        expect(page).to have_content(@user1.name)
        expect(page).to have_content(@user2.name)
      end
    end

    describe "profile" do
      let!(:category) { create(:category, name: 'long obnoxious name') }
      let!(:snippet) { create(:snippet, category: category) }
      let!(:score) { create(:score, snippet: snippet, wpm: 71, user: @user1) }
      it "shows user info and previous scores" do
        visit "/users/#{@user1.id}"

        expect(page).to have_content(@user1.name)
        expect(page).to have_content(snippet.category.name)
        expect(page).to have_content(71)
      end
    end
  end
end
