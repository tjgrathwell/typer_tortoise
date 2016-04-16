require 'rails_helper'

describe CategoriesController do

  before :each do
    @cat_a = create(:category, :name => 'Zedekiah-lasciviously')
    @cat_b = create(:category, :name => 'stringers-goshes')
    @cat_c = create(:category, :name => 'semimonthly-transcendence')
    @categories = [@cat_a, @cat_b, @cat_c]

    @user = create(:user)
    test_sign_in(@user)
  end

  describe 'when not signed in' do
    before :each do
      test_sign_in(nil)
    end

    it 'lists all categories as "enabled"' do
      get :index, :format => :json
      JSON.parse(response.body)['data'].map { |c| c['attributes']['enabled'] }.uniq.should == [true]
    end
  end

  describe 'index' do
    it 'lists all categories as "enabled" for users with no category prefs' do      
      get :index, :format => :json
      JSON.parse(response.body)['data'].map { |c| c['attributes']['enabled'] }.uniq.should == [true]
    end

    it 'lists only the preferred categories as "enabled" for users with category prefs' do
      @cat_prefs = [
        CategoryPreference.create(:user => @user, :category => @cat_a),
        CategoryPreference.create(:user => @user, :category => @cat_b),
      ]
            
      category_data = @categories.map do |c|
        atts = c.attributes
        atts[:enabled] = true
        atts
      end
      category_data[2][:enabled] = false

      get :index, :format => :json
      category_selections = Hash[JSON.parse(response.body)['data'].map do |c|
        [c['id'].to_i, c['attributes']['enabled']]
      end]
      category_selections.should == {
        @cat_a.id => true,
        @cat_b.id => true,
        @cat_c.id => false
      }
    end
  end

  describe 'set_preferences' do

    before :each do
      @cat_prefs = [
        CategoryPreference.create(:user => @user, :category => @cat_a),
        CategoryPreference.create(:user => @user, :category => @cat_b),
      ]
    end

    it "completely replaces a user's existing preferences" do
      @user.category_preferences.map { |p| p.category_id }.should == [@cat_a[:id], @cat_b[:id]]

      post :set_preferences, :categories => [@cat_c[:id]], :format => :json

      @user.category_preferences.map { |p| p.category_id }.should == [@cat_c[:id]]
    end

    it "doesn't do anything for invalid inputs" do
      lambda do
        post :set_preferences, :format => :json
      end.should_not change(CategoryPreference, :count)

      lambda do
        post :set_preferences, :categories => [], :format => :json
      end.should_not change(CategoryPreference, :count)

      lambda do
        post :set_preferences, :categories => ['huskily-interchanging'], :format => :json
      end.should raise_error(ArgumentError)
    end
  end

end
