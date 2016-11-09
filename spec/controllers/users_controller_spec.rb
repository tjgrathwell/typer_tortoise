require 'rails_helper'

describe UsersController do
  describe 'when not logged in' do
    it 'disallows access to the user index' do
      get :index, format: :json
      expect(response).to be_forbidden
    end

    it 'disallows access to user info' do
      get :show, params: { id: 999 }, format: :json
      expect(response).to be_forbidden
    end
  end

  describe 'when logged in' do
    before do
      @user = create(:user)
      test_sign_in(@user)
    end

    describe 'GET #index' do
      it 'returns a list of users' do
        get :index, format: :json
        expect(JSON.parse(response.body)['data'].map { |u| u['attributes']['name'] }).to eq([@user.name])
      end
    end

    describe 'GET #show' do
      it 'returns user info' do
        get :show, params: { id: @user.id }, format: :json
        expect(JSON.parse(response.body)['name']).to eq(@user.name)
      end
    end
  end
end
