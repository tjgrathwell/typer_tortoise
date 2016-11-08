class ScoresController < ApplicationController
  before_action :authenticate, only: [:create]
  respond_to :json

  def create
    @score = current_user.scores.build(score_params)
    if @score.save
      render json: score_json(@score)
    else
      render json: @score.errors, status: :unprocessable_entity
    end
  end

  def index
    scores = []

    if current_user
      scores = current_user.scores.includes(:snippet)
      if params[:limit]
        scores = scores.order('id DESC').limit(params[:limit])
      end
    end

    score_resources = scores.map { |s| ScoreResource.new(s, nil) }
    render json: serializer(include: ['snippet']).serialize_to_hash(score_resources), root: false
  end

  private

  def serializer(options = {})
    JSONAPI::ResourceSerializer.new(ScoreResource, options)
  end

  def score_json(score)
    serializer.serialize_to_hash(ScoreResource.new(score, nil))
  end

  def score_params
    extracted_attributes(:wpm, :accuracy).merge(
      snippet_id: relationship_attribute(:snippet, :id)
    )
  end
end
