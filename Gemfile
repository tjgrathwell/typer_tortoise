source 'https://rubygems.org'

ruby '2.3.1'

gem 'rails', '~> 5.0.0'

gem 'dotenv-rails', groups: [:development, :test]

gem 'omniauth-twitter'
gem 'thin'
gem 'sass-rails'
gem 'uglifier'
gem 'bootstrap-sass'
gem 'ember-cli-rails'
gem 'active_model_serializers'
gem 'responders'
gem 'jsonapi-resources', '~> 0.8.0.beta2'

group :development, :test do
  gem 'sqlite3'
  gem 'rspec-rails'
  gem 'capybara'
  gem 'capybara-screenshot'
  gem 'poltergeist', require: false
  gem 'selenium-webdriver', require: false
  gem 'database_cleaner'
  gem 'awesome_print'
end

group :test do
  gem 'factory_girl_rails'
end

group :production do
  gem 'pg'
  gem 'rails_12factor'
end
