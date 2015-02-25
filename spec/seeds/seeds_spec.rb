require 'rails_helper'

describe "seeds" do
  it "creates a bunch of snippets" do
    expect {
      load Rails.root.join('db', 'seeds.rb')
    }.to change(Snippet, :count)
  end
end
