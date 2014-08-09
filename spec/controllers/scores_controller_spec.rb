require 'rails_helper'

describe ScoresController do

  before(:each) do
    @snippet = create(:snippet)
    @score_data = {
      'wpm' => 19,
      'accuracy' => 29,
      'snippet_id' => @snippet.id,
    }
  end

  describe "POST 'scores'" do

    before(:each) do
      @user = test_sign_in(create(:user))
    end

    describe "failure" do
      it "should not create a score object for empty data" do
        expect {
          post :create, :score => { }
        }.to raise_error
      end

      it "should not create a score object for data that does not validate" do
        lambda do
          post :create, :score => @score_data.merge(:wpm => -10)
        end.should_not change(Score, :count)
      end
    end

    describe "success" do
      it "should create a score object" do
        lambda do
          post :create, :score => @score_data
        end.should change(Score, :count).by(1)
      end
    end
  end

  describe "when not signed in" do

    it "should return an empty response" do
      lambda do
        post :create, :score => @score_data.merge(:wpm => -10)

        response.status.should == 403
      end.should_not change(Score, :count)
    end
  end
end
