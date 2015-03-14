class ScoresController < ApplicationController
  before_filter :authenticate, :only => [:create]
  respond_to :json

  def create
    @score = current_user.scores.build(score_params)
    if @score.save
      head :ok
    else
      render json: @score.errors, status: :unprocessable_entity
    end
  end

  def index
    scores = current_user.try(:scores) || []

    render json: scores, root: false
  end

  private

  def score_params
    params.require(:score).permit(Score::PERMITTED_ATTRIBUTES)
  end
end
