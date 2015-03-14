class CategoriesController < ApplicationController
  before_filter :authenticate, only: [:set_preferences]
  respond_to :json

  def set_preferences
    unless params[:categories].present?
      return head :bad_request
    end

    current_user.set_category_preferences(params[:categories])

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

    render json: all_categories, root: false
  end
end
