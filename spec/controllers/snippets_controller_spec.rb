require 'spec_helper'

describe SnippetsController do

  before(:each) do
    @snippet = Factory(:snippet)
  end

  describe "GET '/snippets/random'" do
    it "should return a random snippet as plaintext" do
      get :random
      response.body.should == @snippet.full_text
    end
  end

  describe "GET '/snippets/random.json'" do
    it "should return a random snippet as json" do
      get :random, :format => :json
      response.body.should == @snippet.to_json
    end

    it "should work if you're logged in with no category preferences" do
      user = Factory(:user)
      test_sign_in(user)
      
      get :random, :format => :json
      response.body.should == @snippet.to_json
    end

    it "should only return snippets in the user's preferences" do
      user = Factory(:user)
      test_sign_in(user)

      category = Factory(:category, :name => 'Mashhad-Mithridates')
      snippet_too = Factory(:snippet,
        :category => category,
        :full_text => 'cynicism-interpersonal',
      )
      CategoryPreference.create(:user => user, :category => category)

      # let's play fight the randomness
      10.times do
        get :random, :format => :json
        response.body.should == snippet_too.to_json
      end
    end

    it "should not return the snippet specified by the 'last_seen' parameter" do
      category = Factory(:category, :name => 'Mashhad-Mithridates')
      snippet_too = Factory(:snippet,
        :category => category,
        :full_text => 'cynicism-interpersonal',
      )

      10.times do
        get :random, :format => :json, :last_seen => @snippet.id
        response.body.should == snippet_too.to_json
      end      
    end

  end

  describe "GET '/snippets/:id.json'" do
    it "should return a particular snippet" do
      snippet_two = Factory(:snippet)

      get :show, :format => :json, :id => @snippet.id
      response.body.should == @snippet.to_json

      get :show, :format => :json, :id => snippet_two.id
      response.body.should == snippet_two.to_json
    end
  end
end
