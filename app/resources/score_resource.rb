class ScoreResource < JSONAPI::Resource
  attribute :wpm
  attribute :accuracy
  attribute :user_id
  attribute :user_name
  has_one :snippet

  def user_name
    @model.user.name
  end
end