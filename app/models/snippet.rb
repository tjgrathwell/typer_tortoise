class Snippet < ActiveRecord::Base
  belongs_to :category
  has_many :scores

  def self.random(options={})
    defaults = {:category_ids => [], :exclude => []}
    options = defaults.merge(options)

    (options[:exclude]+options[:category_ids]).each do |id|
      unless id.to_s.match(/^\d+$/)
        raise ArgumentError, "Arguments to random must be numeric, '#{id.inspect}' isn't."
      end
    end
    options[:exclude].map! { |e| e.to_i }

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
