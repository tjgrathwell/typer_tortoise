class UserResource < JSONAPI::Resource
  attribute :name
  has_many :scores
end
