class ScoresController < ApplicationController
  before_filter :authenticate, :only => [:create]

  def create
    @score = current_user.scores.build(score_params)
    if @score.save
      head :ok
    else
      render json: @score.errors, status: :unprocessable_entity
    end
  end

  def index
    unless signed_in?
      respond_to do |format|
        format.json { render json: [], root: false }
      end
      return
    end

    @scores = current_user.scores

    respond_to do |format|
      format.json { render json: @scores, root: false }
    end
  end

  private

  def score_params
    params.require(:score).permit(Score::PERMITTED_ATTRIBUTES)
  end
end
