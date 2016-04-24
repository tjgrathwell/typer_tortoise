class SnippetsController < ApplicationController
  before_filter :admin_user, only: [:destroy, :create, :update]
  respond_to :json

  def random
    category_ids = params[:category_ids] || []
    if signed_in?
      category_ids = current_user.category_preferences.map { |p| p.category_id }
    end

    exclude = params[:last_seen] ? [params[:last_seen]] : []

    selected_snip = Snippet.random(:category_ids => category_ids, :exclude => exclude)

    render json: simple_snippet_json(selected_snip)
  end

  def index
    snippets = Snippet.all
    if params[:category_id]
      snippets = snippets.of_category(params[:category_id])
    end

    json = serializer.serialize_to_hash(snippets.map { |s| SnippetResource.new(s, nil) })
    render json: json
  end

  def show
    snippet = Snippet.includes(:category, scores: [:user]).find(params[:id])

    render json: detailed_snippet_json(snippet)
  end

  def create
    snippet = Snippet.new(snippet_params)

    if snippet.save
      render json: detailed_snippet_json(snippet), status: :created
    else
      render json: snippet.errors, status: :unprocessable_entity
    end
  end

  def update
    snippet = Snippet.find(params[:data][:id])

    if snippet.update_attributes(snippet_params)
      render json: detailed_snippet_json(snippet)
    else
      render json: snippet.errors, status: :unprocessable_entity
    end
  end

  def destroy
    snippet = Snippet.find(params[:id])
    snippet.destroy

    render json: simple_snippet_json(snippet)
  end

  private

  def serializer(options = {})
    JSONAPI::ResourceSerializer.new(SnippetResource, options)
  end

  def simple_snippet_json(selected_snip)
    serializer.serialize_to_hash(SnippetResource.new(selected_snip, nil))
  end

  def detailed_snippet_json(snippet)
    serializer(include: ['scores']).serialize_to_hash(SnippetResource.new(snippet, nil))
  end

  def snippet_params
    extracted_attributes(:full_text, :category_id)
  end
end
