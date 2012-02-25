class Snippet < ActiveRecord::Base
  belongs_to :category
  has_many :scores

  def self.random(preferred_category_ids)
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
