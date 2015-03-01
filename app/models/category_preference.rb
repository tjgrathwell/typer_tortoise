class CategoryPreference < ActiveRecord::Base
  belongs_to :user
  belongs_to :category

  validates :user_id, :category_id, presence: true
end
