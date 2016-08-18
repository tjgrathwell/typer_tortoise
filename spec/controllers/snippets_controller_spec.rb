require 'rails_helper'

describe SnippetsController do

  before(:each) do
    @snippet = create(:snippet)
  end

  describe "GET '/snippets/random'" do
    it "should return a random snippet as json" do
      get :random, :format => :json
      JSON.parse(response.body)['data']['attributes']['full-text'].should == @snippet.full_text
    end

    it "accepts a whitelist of categories" do
      category = create(:category, :name => 'Mashhad-Mithridates')
      snippet_too = create(:snippet,
        :category => category,
        :full_text => 'cynicism-interpersonal',
      )

      10.times do
        get :random, params: { :category_ids => [category.id] }, :format => :json
        JSON.parse(response.body)['data']['id'].to_i.should == snippet_too.id
      end      
    end

    it "should work if you're logged in with no category preferences" do
      user = create(:user)
      test_sign_in(user)
      
      get :random, :format => :json
      JSON.parse(response.body)['data']['id'].to_i.should == @snippet.id
    end

    it "should only return snippets in the user's preferences" do
      user = create(:user)
      test_sign_in(user)

      category = create(:category, :name => 'Mashhad-Mithridates')
      snippet_too = create(:snippet,
        :category => category,
        :full_text => 'cynicism-interpersonal',
      )
      CategoryPreference.create(:user => user, :category => category)

      # let's play fight the randomness
      10.times do
        get :random, :format => :json
        JSON.parse(response.body)['data']['id'].to_i.should == snippet_too.id
      end
    end

    it "should not return the snippet specified by the 'last_seen' parameter" do
      category = create(:category, :name => 'Mashhad-Mithridates')
      snippet_too = create(:snippet,
        :category => category,
        :full_text => 'cynicism-interpersonal',
      )

      10.times do
        get :random, params: { :last_seen => @snippet.id }, :format => :json
        JSON.parse(response.body)['data']['id'].to_i.should == snippet_too.id
      end      
    end

  end

  describe "GET '/snippets/:id'" do
    it "should return a particular snippet" do
      get :show, params: { :id => @snippet.id }, :format => :json
      JSON.parse(response.body)['data']['id'].to_i.should == @snippet.id
    end
  end
end
