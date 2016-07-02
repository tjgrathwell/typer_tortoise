ENV["RAILS_ENV"] ||= 'test'

require 'spec_helper'
require File.expand_path("../../config/environment", __FILE__)
require 'rspec/rails'
require 'capybara-screenshot/rspec'

def choose_javascript_driver
  if ENV['SELENIUM']
    require 'selenium-webdriver'
    :selenium
  else
    require 'capybara/poltergeist'
    :poltergeist
  end
end

Capybara.javascript_driver = choose_javascript_driver
Capybara.save_path = Rails.root.join('tmp', 'capybara-screenshots')

Dir[Rails.root.join("spec/support/**/*.rb")].each {|f| require f}

RSpec.configure do |config|
  config.infer_spec_type_from_file_location!

  # Add in the short method names from FactoryGirl ('build', 'create' ...)
  config.include FactoryGirl::Syntax::Methods

  config.use_transactional_fixtures = false

  config.example_status_persistence_file_path = Rails.root.join('tmp', 'rspec_examples.txt')

  # If true, the base class of anonymous controllers will be inferred
  # automatically. This will be the default behavior in future versions of
  # rspec-rails.
  config.infer_base_class_for_anonymous_controllers = false

  config.before(:suite) do
    DatabaseCleaner.clean_with(:truncation)
  end

  config.before(:each) do |example|
    DatabaseCleaner.strategy = example.metadata[:js] ? :truncation : :transaction
    DatabaseCleaner.start
  end

  config.after(:each) do
    DatabaseCleaner.clean
  end

  def test_sign_in(user)
    controller.sign_in user
  end
end
