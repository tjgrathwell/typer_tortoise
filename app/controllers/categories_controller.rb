class CategoriesController < ApplicationController
  before_action :authenticate, only: [:set_preferences]
  respond_to :json

  def set_preferences
    unless params[:categories].present?
      return head :bad_request
    end

    current_user.prefer_categories!(params[:categories])

    render json: {}, status: :ok
  end

  def index
    category_resources = Category.all.map { |c| CategoryResource.new(c, nil) }
    category_resources.each do |category_resource|
      category_resource.enabled = category_resource_enabled?(category_resource)
    end

    render json: serializer.serialize_to_hash(category_resources)
  end

  private

  def enabled_categories
    if signed_in?
      current_user.category_preferences.map { |pref| pref.category.name }.to_set
    else
      []
    end
  end

  def category_resource_enabled?(category_resource)
    if enabled_categories.empty?
      true
    else
      enabled_categories.include?(category_resource.name)
    end
  end

  def serializer(options = {})
    JSONAPI::ResourceSerializer.new(CategoryResource, options)
  end

  def category_json(score)
    serializer.serialize_to_hash(CategoryResource.new(score, nil))
  end
end
