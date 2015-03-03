class Snippet < ActiveRecord::Base
  belongs_to :category
  has_many :scores, dependent: :destroy

  validates_presence_of :category

  default_scope { includes(:category).order("#{table_name}.id") }
  scope :of_category, -> (category_id) { where(category_id: category_id) }

  def self.random(options={})
    defaults = {:category_ids => [], :exclude => []}
    options = defaults.merge(options)

    [:exclude, :category_ids].each do |param|
      unless options[param].respond_to? :each
        raise ArgumentError, "Arguments to #{__method__} must be iterable, '#{options[param]}' isn't."
      end
      options[param].each do |id|
        unless id.to_s.match(/^\d+$/)
          raise ArgumentError, "Arguments to #{__method__} must be numeric, '#{id.inspect}' isn't."
        end
      end
      options[param].map! { |e| e.to_i }
    end

    snippets_relation = Snippet
    snippets_relation = snippets_relation.where(category_id: options[:category_ids]) if options[:category_ids].present?
    snippets_relation = snippets_relation.where('id NOT IN (?)', options[:exclude]) if options[:exclude].present?
    snippets = snippets_relation.respond_to?(:to_a) ? snippets_relation.to_a : snippets_relation.all.to_a

    return nil if snippets.empty?

    return snippets.sample
  end

  def as_json(params = {})
    super.merge(
      category_name: category.name,
      scores: scores.as_json
    )
  end
end
