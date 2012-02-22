class Score < ActiveRecord::Base
  attr_accessible :wpm, :accuracy, :user_id, :snippet_id

  belongs_to :user
  has_one :snippet

  validates :wpm, :accuracy, :user_id, :presence => true

  validates :wpm,      :numericality => { :less_than_or_equal_to => 300 }
  validates :accuracy, :numericality => { :less_than_or_equal_to => 100 }

  validates :wpm, :accuracy, :numericality => { :greater_than_or_equal_to => 0 }
end
