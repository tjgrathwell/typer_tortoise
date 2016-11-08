require 'rails_helper'

describe "signing in with omniauth", js: true do
  let!(:snippet) { create(:snippet, full_text: 'cynicism-interpersonal') }
  let(:twitter_response) do
    {
      provider: "twitter",
      uid: "123456",
      info: {
        nickname: "johnqpublic",
        name: "John Q Public",
        location: "Anytown, USA",
        image: "http://si0.twimg.com/sticky/default_profile_images/default_profile_2_normal.png",
        description: "a very normal guy.",
        urls: {
          Website: nil,
          Twitter: "https://twitter.com/johnqpublic"
        }
      },
      credentials: {
        token: "a1b2c3d4",
        secret: "abcdef1234"
      }
    }
  end

  before do
    OmniAuth.config.test_mode = true
  end

  context "with a valid twitter auth" do
    before do
      OmniAuth.config.mock_auth[:twitter] = OmniAuth::AuthHash.new(twitter_response)
    end

    it 'creates an identity and signs you in' do
      visit "/snippets/#{snippet.id}"

      page.should have_content snippet.full_text

      click_on 'Sign in with Twitter'

      page.should have_content "Logged in as John Q Public."
      page.should have_content snippet.full_text
      page.current_path.should == "/snippets/#{snippet.id}"
    end
  end
end
