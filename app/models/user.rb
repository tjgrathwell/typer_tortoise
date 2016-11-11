class User < ActiveRecord::Base
  has_many :identities
  has_many :scores
  has_many :category_preferences

  def prefer_categories!(categories)
    ParamChecker.new(__method__).force_integers!(categories)

    category_preferences.destroy_all

    prefs = category_preferences
    categories.each do |category_id|
      prefs.create(user: self, category_id: category_id)
    end
  end

  def self.create_with_omniauth(auth)
    create(name: auth['info']['name'])
  end
end
