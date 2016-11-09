require 'rails_helper'

describe "typing a snippet", js: true do
  def type_on_snippet(snippet)
    visit "/snippets/#{snippet.id}/play"

    expect(page).to have_content(snippet.full_text)

    page.find('.type-panel').native.send_key(snippet.full_text)
  end

  before do
    @snippet = create(:snippet, full_text: 'hello world')
    create(:snippet, full_text: 'another snippet')
  end

  it "proceeds to another random snippet" do
    type_on_snippet(@snippet)

    expect(page).to have_content('another snippet')
  end

  context 'when signed in' do
    before do
      sign_in_with_twitter_as create(:user)
    end

    it "saves the user's WPM and error rate" do
      type_on_snippet(@snippet)

      within('.player-scores tbody td', match: :first) do
        expect(page).to have_content(@snippet.id)
      end

      expect(User.last.scores.length).to eq(1)
    end
  end
end
