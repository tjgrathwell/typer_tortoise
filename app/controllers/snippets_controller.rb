class SnippetsController < ApplicationController
  before_filter :admin_user, only: [:destroy, :create, :update, :new, :edit]
  respond_to :json

  def random
    category_ids = params[:category_ids] || []
    if signed_in?
      category_ids = current_user.category_preferences.map { |p| p.category_id }
    end

    exclude = params[:last_seen] ? [params[:last_seen]] : []

    selected_snip = Snippet.random(:category_ids => category_ids, :exclude => exclude)

    render json: serializer.serialize_to_hash(SnippetResource.new(selected_snip, nil))
  end

  def index
    snippets = Snippet.all
    if params[:category_id]
      snippets = snippets.of_category(params[:category_id])
    end

    render json: snippets
  end

  def show
    snippet = Snippet.includes(:category, scores: [:user]).find(params[:id])

    json = serializer(include: ['scores'])
             .serialize_to_hash(SnippetResource.new(snippet, nil))
    render json: json
  end

  def serializer(options = {})
    JSONAPI::ResourceSerializer.new(SnippetResource, options)
  end

  def create
    snippet = Snippet.new(snippet_params)

    if snippet.save
      render json: snippet.as_detailed_json, status: :created
    else
      render json: snippet.errors, status: :unprocessable_entity
    end
  end

  def update
    snippet = Snippet.find(params[:id])

    if snippet.update_attributes(snippet_params)
      render json: snippet.as_detailed_json
    else
      render json: snippet.errors, status: :unprocessable_entity
    end
  end

  def destroy
    snippet = Snippet.find(params[:id])
    snippet.destroy

    render json: {}
  end

  private

  def snippet_params
    params.require(:snippet).permit(:full_text, :category_id)
  end
end
