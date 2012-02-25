class User < ActiveRecord::Base
  has_many :identities
  has_many :scores
  has_many :category_preferences

  def self.create_with_omniauth(auth)
    create(name: auth['info']['name'])
  end
end
