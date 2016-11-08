class CategoryResource < JSONAPI::Resource
  attribute :name
  attribute :enabled
  attr_accessor :enabled
end
