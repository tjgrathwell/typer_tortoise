require 'spec_helper'

describe Snippet do

  before do
    @snippet1 = create(:snippet, :full_text => 'editorship-contradictory', :category_id => 1)
    @snippet2 = create(:snippet, :full_text => 'scarecrow-bugbears',       :category_id => 2)
    @snippet3 = create(:snippet, :full_text => 'squelch-Alisha',           :category_id => 3)
  end

  describe 'random' do
    it "doesn't freak out when given no arguments" do
      Snippet.random.category_id.should be_between(1, 3)
    end

    it 'gives you a snippet from the category you ask for' do
      Snippet.random(:category_ids => [2]).should == @snippet2
    end

    it 'asserts if given anything other than an integer' do
      [:category_ids, :exclude].each do |arg|
        lambda do
          Snippet.random(arg => [nil])
        end.should raise_error(ArgumentError)

        lambda do
          Snippet.random(arg => ['qualified-pleasant'])
        end.should raise_error(ArgumentError)
      end
    end
  end

end
