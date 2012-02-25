class UsersController < ApplicationController
  def show
    @user = User.find(params[:id])
    unless (@user)
      deny_access
    end

    @scores_by_category = {}
    @user.scores.each do |score|
      # i wonder how the performance of this is? does rails have some kind of prefetch?
      (@scores_by_category[score.snippet.category.name] ||= []).push(score)
    end
  end

  def index
    @users = User.all
  end

  def scores
    @user = User.find(params[:id])
    unless (@user)
      deny_access
    end

    respond_to do |format|
      format.json { render json: @user.scores }
    end
  end
end
