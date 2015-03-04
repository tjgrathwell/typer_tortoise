source 'https://rubygems.org'
source 'https://rails-assets.org'

ruby '2.1.2'

gem 'rails', '4.2.0'

gem 'omniauth-twitter'
gem 'thin'
gem 'jquery-rails'
gem 'sass-rails'
gem 'uglifier'
gem 'bootstrap-sass'
gem 'ember-rails'
gem 'ember-source', '~> 1.5.0'
gem 'rails-assets-es5-shim'
gem 'handlebars_assets'

group :development, :test do
  gem 'jasmine'
  gem 'sqlite3'
  gem 'rspec-rails'
  gem 'capybara'
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
