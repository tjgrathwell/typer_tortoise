require 'rails_helper'

describe Snippet do
  before do
    @category1, @category2, @category3 = create_list(:category, 3)
    @snippet1 = create(:snippet, full_text: 'editorship-contradictory', category: @category1)
    @snippet2 = create(:snippet, full_text: 'scarecrow-bugbears',       category: @category2)
    @snippet3 = create(:snippet, full_text: 'squelch-Alisha',           category: @category3)
  end

  describe 'random' do
    it "doesn't freak out when given no arguments" do
      expect(Category.pluck(:id)).to include(Snippet.random.category_id)
    end

    it 'gives you a snippet from the category you ask for' do
      expect(Snippet.random(category_ids: [@category2.id])).to eq(@snippet2)
    end

    it 'asserts if given anything other than an integer' do
      [:category_ids, :exclude].each do |arg|
        expect do
          Snippet.random(arg => [nil])
        end.to raise_error(ArgumentError)

        expect do
          Snippet.random(arg => ['qualified-pleasant'])
        end.to raise_error(ArgumentError)
      end
    end
  end
end
