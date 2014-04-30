class User < ActiveRecord::Base
  attr_accessible :name

  has_many :identities
  has_many :scores
  has_many :category_preferences

  def set_category_preferences(categories)
    categories.each do |id|
      unless id.to_s.match(/^\d+$/)
        raise ArgumentError, "Arguments to #{__method__} must be numeric, '#{id.inspect}' isn't."
      end
    end

    self.category_preferences.destroy_all()

    prefs = self.category_preferences
    categories.each do |category_id|
      prefs.create(:user => self, :category_id => category_id)
    end
  end

  def self.create_with_omniauth(auth)
    create(name: auth['info']['name'])
  end
end
