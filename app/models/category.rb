class Category < ActiveRecord::Base
  has_many :snippets, dependent: :destroy
  has_many :category_preferences, dependent: :destroy
end
