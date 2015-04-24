class User < ActiveRecord::Base
  has_many :identities
  has_many :scores
  has_many :category_preferences

  def set_category_preferences(categories)
    ParamChecker.new(__method__).force_integers!(categories)

    self.category_preferences.destroy_all

    prefs = self.category_preferences
    categories.each do |category_id|
      prefs.create(:user => self, :category_id => category_id)
    end
  end

  def self.create_with_omniauth(auth)
    create(name: auth['info']['name'])
  end
end
