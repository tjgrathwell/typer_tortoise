require 'rails_helper'

describe "typing a snippet", js: true do
  before do
    @snippet = create(:snippet, full_text: 'hello world')
    create(:snippet, full_text: 'another snippet')
  end

  it "proceeds to another random snippet" do
    visit play_snippet_path(@snippet)

    page.should have_content('hello world')

    page.find('.type-panel').native.send_key('hello world')

    page.should have_content('another snippet')
  end
end
