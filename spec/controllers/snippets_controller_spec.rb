require 'spec_helper'

describe SnippetsController do

  before(:each) do
    @snippet = Factory(:snippet)
  end

  describe "GET 'random'" do
    it "should return a snippet as plaintext" do
      get 'random'
      response.should be_success

      response.body.should == @snippet.full_text
    end
  end

  describe "GET 'random.json'" do
    it "should return the snippet as json" do
      get 'random', :format => :json
      response.should be_success

      parsed_body = JSON.parse(response.body)
      
      parsed_body['category'].should == @snippet.category
      parsed_body['short_desc'].should == @snippet.short_desc
      parsed_body['full_text'].should == @snippet.full_text
      parsed_body['id'].should == @snippet.id
    end
  end
end
