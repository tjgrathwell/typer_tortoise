class Score < ActiveRecord::Base
  belongs_to :user
  has_one :snippet
end
