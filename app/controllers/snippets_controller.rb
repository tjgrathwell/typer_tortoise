class SnippetsController < ApplicationController
  before_filter :admin_user, only: [:destroy, :create, :update, :new, :edit]

  def random
    category_ids = params[:category_ids] || []
    if signed_in?
      category_ids = current_user.category_preferences.map { |p| p.category_id }
    end

    exclude = params[:last_seen] ? [params[:last_seen]] : []

    selected_snip = Snippet.random(:category_ids => category_ids, :exclude => exclude)

    respond_to do |format|
      format.json { render json: selected_snip }
    end
  end

  def index
    @snippets = Snippet.all
    if params[:category_id]
      @snippets = @snippets.of_category(params[:category_id])
    end

    respond_to do |format|
      format.json { render json: @snippets }
    end
  end

  def show
    @snippet = Snippet.includes(:category, scores: [:user]).find(params[:id])

    respond_to do |format|
      format.json { render json: @snippet.as_detailed_json }
    end
  end

  def create
    @snippet = Snippet.new(snippet_params)

    respond_to do |format|
      if @snippet.save
        format.json { render json: @snippet.as_detailed_json, status: :created }
      else
        format.json { render json: @snippet.errors, status: :unprocessable_entity }
      end
    end
  end

  def update
    @snippet = Snippet.find(params[:id])

    respond_to do |format|
      if @snippet.update_attributes(snippet_params)
        format.json { render json: @snippet.as_detailed_json }
      else
        format.json { render json: @snippet.errors, status: :unprocessable_entity }
      end
    end
  end

  def destroy
    @snippet = Snippet.find(params[:id])
    @snippet.destroy

    respond_to do |format|
      format.json { render json: {} }
    end
  end

  private

  def snippet_params
    params.require(:snippet).permit(:full_text, :category_id)
  end
end
