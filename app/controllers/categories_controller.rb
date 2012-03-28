class CategoriesController < ApplicationController
  before_filter :authenticate, only: [:overwrite]

  def overwrite
    if !params[:categories] || params[:categories].length == 0
      render :text => ''
      return
    end

    current_user.category_preferences.destroy_all()

    prefs = current_user.category_preferences
    params[:categories].each do |category_id|
      prefs.create(:user => current_user, :category_id => category_id)
    end

    render :text => ''
  end

  def show
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
      format.json { render json: all_categories }
    end
  end
end
