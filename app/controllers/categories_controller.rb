class CategoriesController < ApplicationController
  before_action :authenticate, only: [:set_preferences]
  respond_to :json

  def set_preferences
    unless params[:categories].present?
      return head :bad_request
    end

    current_user.set_category_preferences(params[:categories])

    render json: {}, status: :ok
  end

  def index
    if signed_in?
      enabled_categories = current_user.category_preferences.map { |pref| pref.category.name }.to_set
    else
      enabled_categories = []
    end

    category_resources = Category.all.map { |c| CategoryResource.new(c, nil) }
    category_resources.each do |category_resource|
      if enabled_categories.empty?
        category_resource.enabled = true
      else
        category_resource.enabled = enabled_categories.include?(category_resource.name)
      end
    end

    render json: serializer.serialize_to_hash(category_resources)
  end

  private

  def serializer(options = {})
    JSONAPI::ResourceSerializer.new(CategoryResource, options)
  end

  def category_json(score)
    serializer.serialize_to_hash(CategoryResource.new(score, nil))
  end
end
