class ScoresController < ApplicationController
  before_filter :authenticate, :only => [:create]

  def create
    @score = current_user.scores.build(params[:score])
    if (@score.save)
      head :ok
    else
      render json: @score.errors, status: :unprocessable_entity
    end
  end

  def show
    unless signed_in?
      respond_to do |format|
        format.json { render json: [] }
      end
      return
    end

    @scores = current_user.scores

    respond_to do |format|
      format.json { render json: @scores }
    end
  end
end
