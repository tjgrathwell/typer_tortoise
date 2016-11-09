require 'rails_helper'

describe "home page", js: true do
  before do
    create(:snippet, full_text: 'hello world')
  end

  it "shows a snippet" do
    visit '/'

    expect(page).to have_content('hello world')
  end
end

describe "invalid pages", js: true do
  it 'shows a 404 message' do
    visit '/sandwich/showdown'

    expect(page).to have_content('Not Found')
    expect(page).to have_content('/sandwich/showdown')
  end
end
