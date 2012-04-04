class Snippet < ActiveRecord::Base
  belongs_to :category
  has_many :scores
  default_scope includes(:category).order("#{table_name}.id")
  scope :of_category, lambda { |category_id| {conditions: {category_id: category_id} } }

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

    all_snips = Snippet.all

    return nil if all_snips.empty?

    unless options[:category_ids].empty?
      all_snips.select! do |snippet|
        options[:category_ids].include? snippet.category_id
      end
    end

    if all_snips.length <= options[:exclude].length
      # too few snippets selected to properly exclude, return one anyway
      return all_snips.sample
    end

    snippet = nil
    while true
      snippet = all_snips.sample
      break unless options[:exclude].include? snippet.id
    end
    return snippet
  end
end
