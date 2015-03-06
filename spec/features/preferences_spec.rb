require 'rails_helper'

describe "changing preferences", js: true do
  let(:user) { create(:user) }
  before do
    Identity.create(
      user_id: user.id,
      provider: 'twitter',
      uid: '12345'
    )

    OmniAuth.config.test_mode = true
    OmniAuth.config.add_mock(:twitter, {uid: '12345'})

    @cat_a = create(:category, name: 'Category A')
    @cat_b = create(:category, name: 'Category B')
    @snippet_a = create(:snippet, full_text: 'catAsnip', category: @cat_a),
    @snippet_b = create(:snippet, full_text: 'catBsnip', category: @cat_b),
    create(:category_preference, user: user, category: @cat_a)
  end

  it "updates the database and shows a new snippet when appropriate" do
    visit '/auth/twitter'
    page.should have_content(/catAsnip/m)

    page.find('.prefs-link').click
    check 'Category B'
    click_on 'Save Preferences'

    wait_for_condition do
      user.category_preferences.pluck(:category_id).try(:sort) == [@cat_a.id, @cat_b.id].sort
    end

    page.should have_content(/catAsnip/m)

    page.find('.prefs-link').click
    uncheck 'Category A'
    click_on 'Save Preferences'

    page.should have_content(/catBsnip/m)

    expect(user.category_preferences.pluck(:category_id)).to match_array([@cat_b.id])
  end
end
