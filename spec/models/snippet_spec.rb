require 'spec_helper'

describe Snippet do

  before :each do
    @snippets = [
      Factory(:snippet, :full_text => 'editorship-contradictory', :category_id => 1),
      Factory(:snippet, :full_text => 'scarecrow-bugbears',       :category_id => 2),
      Factory(:snippet, :full_text => 'squelch-Alisha',           :category_id => 3),
    ]
  end

  describe 'random' do
    it "doesn't freak out when given no arguments" do
      Snippet.random.category_id.should be_between(1, 3)
    end

    it 'gives you a snippet from the category you ask for' do
      Snippet.random([2]).should == @snippets[1]
    end

    it 'asserts if given anything other than an integer' do
      lambda do
        Snippet.random([nil])
      end.should raise_error(ArgumentError)

      lambda do
        Snippet.random(['qualified-pleasant'])
      end.should raise_error(ArgumentError)
    end
  end

end
