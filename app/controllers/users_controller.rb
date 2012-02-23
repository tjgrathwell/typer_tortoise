class UsersController < ApplicationController
  def show
    @user = User.find(params[:id])
    unless (@user)
      deny_access
    end

    @scores_by_category = {}
    @user.scores.each do |score|
      # here's some n*m performance that's not so good. handwritten sql in the future?
      # also, trying score.snippet tried to fetch a snippet by score_id, which is odd.
      snippet = Snippet.find(score.snippet_id)
      (@scores_by_category[snippet.category] ||= []).push(score)
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
