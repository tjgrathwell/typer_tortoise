class SnippetResource < JSONAPI::Resource
  attribute :full_text
  attribute :category_id
  attribute :category_name
  has_many :scores

  def category_name
    @model.category.name
  end
end