require 'rails_helper'

describe ScoresController do
  before(:each) do
    @snippet = create(:snippet)
    @score_data = {
      'wpm' => 19,
      'accuracy' => 29
    }
  end

  def score_params
    {
      data: {
        attributes: @score_data,
        relationships: {
          snippet: {
            data: {
              id: @snippet.id
            }
          }
        }
      }
    }
  end

  describe "POST 'scores'" do
    before(:each) do
      @user = test_sign_in(create(:user))
    end

    describe "failure" do
      it "should not create a score object for empty data" do
        expect do
          post :create, params: { score: {} }, format: :json
        end.to raise_error(ActionController::ParameterMissing)
      end

      it "should not create a score object for data that does not validate" do
        @score_data['wpm'] = -10
        expect do
          post :create, params: score_params, headers: { format: :json }
        end.not_to change(Score, :count)
      end
    end

    describe "success" do
      it "should create a score object" do
        expect do
          post :create, params: score_params, headers: { format: :json }
        end.to change(Score, :count).by(1)
      end
    end
  end

  describe "when not signed in" do
    it "should return an empty response" do
      expect do
        post :create, params: score_params, headers: { format: :json }

        expect(response.status).to eq(403)
      end.not_to change(Score, :count)
    end
  end
end
