require 'rails_helper'

describe "changing preferences", js: true do
  let(:user) { create(:user) }
  before do
    @cat_a = create(:category, name: 'Category A')
    @cat_b = create(:category, name: 'Category B')
    @snippet_a = create(:snippet, full_text: 'catAsnip', category: @cat_a),
    @snippet_b = create(:snippet, full_text: 'catBsnip', category: @cat_b),
    create(:category_preference, user: user, category: @cat_a)

    sign_in_with_twitter_as(user)
  end

  it "updates the database and shows a new snippet when appropriate" do
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

  it 'dismisses the modal when the background is clicked' do
    popup_selector = '.prefs-popup'

    page.find('.prefs-link').click

    expect(page).to have_css(popup_selector)

    page.find('.modal-view-bg').trigger('click')

    expect(page).to have_no_css(popup_selector)
  end
end
