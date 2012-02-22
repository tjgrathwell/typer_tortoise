class UsersController < ApplicationController
  def show_scores
    @user = User.find(params[:user_id])
    unless (@user)
      deny_access
    end
    respond_to do |format|
      format.json { render json: @user.scores }
    end
  end
end
