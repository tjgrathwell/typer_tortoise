require 'spec_helper'

describe ScoresController do

  before(:each) do
    @user = Factory(:user)
    @snippet = Factory(:snippet)
  end

  describe "POST 'scores'" do
    it "should be successful" do
      post 'scores'
      response.should be_success
    end
  end

end
