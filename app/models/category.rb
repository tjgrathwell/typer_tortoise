class Category < ActiveRecord::Base
  has_many :snippets
  has_many :category_preferences
end
