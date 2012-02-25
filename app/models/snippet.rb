class Snippet < ActiveRecord::Base
  belongs_to :category
  has_many :scores

  def self.random(preferred_category_ids=[])
    preferred_category_ids.each do |id|
      unless id.to_s.match(/^\d+$/)
        raise ArgumentError, "Arguments to random must be numeric, '#{id.inspect}' isn't."
      end
    end

    all_snips = Snippet.all

    if all_snips.empty?
      return nil
    end

    unless preferred_category_ids.empty?
      all_snips.select! do |snippet|
        preferred_category_ids.include? snippet.category_id
      end
    end

    return all_snips.sample
  end
end
