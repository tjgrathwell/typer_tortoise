source 'https://rubygems.org'

ruby '2.2.4'

gem 'rails', '4.2.5'

gem 'dotenv-rails', groups: [:development, :test]

gem 'omniauth-twitter'
gem 'thin'
gem 'jquery-rails'
gem 'sass-rails'
gem 'uglifier'
gem 'bootstrap-sass'
gem 'ember-rails'
gem 'ember-source', '1.12.1'
gem 'responders'
gem 'sprockets', '2.12.3'

group :development, :test do
  gem 'jasmine'
  gem 'sqlite3'
  gem 'rspec-rails'
  gem 'capybara'
  gem 'capybara-screenshot'
  gem 'poltergeist', require: false
  gem 'selenium-webdriver', require: false
  gem 'database_cleaner'
  gem 'awesome_print'
end

group :development do
  gem 'quiet_assets'
end

group :test do
  gem 'factory_girl_rails'
end

group :production do
  gem 'pg'
  gem 'rails_12factor'
end

source 'https://rails-assets.org' do
  gem 'rails-assets-es5-shim'
  gem 'rails-assets-highlightjs'
end
