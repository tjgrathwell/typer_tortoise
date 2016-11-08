class Snippet < ActiveRecord::Base
  belongs_to :category
  has_many :scores, dependent: :destroy

  validates_presence_of :category, :full_text

  default_scope { includes(:category).order("#{table_name}.id") }
  scope :of_category, ->(category_id) { where(category_id: category_id) }

  def self.random(options = {})
    defaults = { category_ids: [], exclude: [] }
    options = defaults.merge(options)

    ParamChecker.new(__method__).force_integers!(options[:exclude], options[:category_ids])

    snippets_relation = Snippet
    snippets_relation = snippets_relation.where(category_id: options[:category_ids]) if options[:category_ids].present?
    snippets_relation = snippets_relation.where('id NOT IN (?)', options[:exclude]) if options[:exclude].present?
    snippets = snippets_relation.respond_to?(:to_a) ? snippets_relation.to_a : snippets_relation.all.to_a

    return nil if snippets.empty?

    snippets.sample
  end
end
