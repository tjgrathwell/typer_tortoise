class UsersController < ApplicationController
  respond_to :json

  def show
    user = User.find(params[:id])
    unless user
      deny_access
    end

    scores_by_category = Hash.new { |h, k| h[k] = [] }
    user.scores.includes(:snippet => :category).each do |score|
      Rails.logger.error score.snippet.id
      scores_by_category[score.snippet.category.name].push(score)
    end


    Rails.logger.error scores_by_category.inspect

    score_categories = scores_by_category.map do |category, scores|
      {
        name: category,
        scores: scores.map(&:as_json)
      }
    end

    render json: user.as_json.merge(score_categories: score_categories)
  end

  def index
    render json: User.all
  end

  def scores
    user = User.find(params[:id])
    unless user
      deny_access
    end

    render json: user.scores
  end
end
