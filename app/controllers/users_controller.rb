class UsersController < ApplicationController
  def show
    user = User.find(params[:id])
    unless user
      deny_access
    end

    scores_by_category = {}
    user.scores.each do |score|
      # i wonder how the performance of this is? does rails have some kind of prefetch?
      (scores_by_category[score.snippet.category.name] ||= []).push(score)
    end

    score_categories = scores_by_category.map do |category, scores|
      {
        name: category,
        scores: scores.map(&:as_json)
      }
    end

    respond_to do |format|
      format.json { render json: user.as_json.merge(score_categories: score_categories) }
    end
  end

  def index
    respond_to do |format|
      format.json { render json: User.all }
    end
  end

  def scores
    @user = User.find(params[:id])
    unless @user
      deny_access
    end

    respond_to do |format|
      format.json { render json: @user.scores }
    end
  end
end
