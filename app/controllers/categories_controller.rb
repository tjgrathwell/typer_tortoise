class CategoriesController < ApplicationController
  before_filter :authenticate, only: [:overwrite]

  def overwrite
    if !params[:categories] || params[:categories].empty?
      return head :bad_request
    end

    current_user.overwrite_category_preferences(params[:categories])

    head :ok
  end

  def index
    if signed_in?
      enabled_categories = current_user.category_preferences.map { |pref| pref.category.name }.to_set
    else
      enabled_categories = []
    end

    all_categories = Category.all.map { |c| c.attributes }
    all_categories.each do |category|
      if enabled_categories.empty?
        category[:enabled] = true
      else
        category[:enabled] = enabled_categories.include? category['name']
      end
    end

    respond_to do |format|
      format.json { render json: all_categories, root: false }
    end
  end
end
