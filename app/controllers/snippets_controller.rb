class SnippetsController < ApplicationController
  before_filter :admin_user, only: [:destroy, :create, :update, :new, :edit]

  # GET /random
  # GET /random.json
  def random
    category_ids = params[:category_ids] || []
    if signed_in?
      category_ids = current_user.category_preferences.map { |p| p.category_id }
    end

    exclude = params[:last_seen] ? [params[:last_seen]] : []

    selected_snip = Snippet.random(:category_ids => category_ids, :exclude => exclude)

    respond_to do |format|
      format.json { render json: selected_snip.to_json }
    end
  end

  # GET /snippets
  # GET /snippets.json
  def index
    @categories = Category.all
    @snippets = Snippet.page(params[:page])
    if params[:category_id]
      @snippets = @snippets.of_category(params[:category_id])
    end

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @snippets }
    end
  end

  # GET /snippets/1
  # GET /snippets/1.json
  def show
    @snippet = Snippet.includes(:category, scores: [:user]).find(params[:id])

    respond_to do |format|
      format.json { render json: @snippet }
    end
  end

  # POST /snippets
  # POST /snippets.json
  def create
    @snippet = Snippet.new(snippet_params)

    respond_to do |format|
      if @snippet.save
        format.json { render json: @snippet, status: :created }
      else
        format.json { render json: @snippet.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /snippets/1
  # PUT /snippets/1.json
  def update
    @snippet = Snippet.find(params[:id])

    respond_to do |format|
      if @snippet.update_attributes(snippet_params)
        format.json { render json: @snippet }
      else
        format.json { render json: @snippet.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /snippets/1
  # DELETE /snippets/1.json
  def destroy
    @snippet = Snippet.find(params[:id])
    @snippet.destroy

    respond_to do |format|
      format.html { redirect_to snippets_url }
      format.json { head :ok }
    end
  end

  private

  def snippet_params
    params.require(:snippet).permit(:full_text, :category_id)
  end
end
