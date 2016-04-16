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

  # If you're not using ActiveRecord, or you'd prefer not to run each of your
  # examples within a transaction, remove the following line or assign false
  # instead of true.
  config.use_transactional_fixtures = true

  config.example_status_persistence_file_path = Rails.root.join('tmp', 'rspec_examples.txt')

  # If true, the base class of anonymous controllers will be inferred
  # automatically. This will be the default behavior in future versions of
  # rspec-rails.
  config.infer_base_class_for_anonymous_controllers = false

  # Monkey-patch to force single DB connection even in multithreaded
  #   tests (selenium/capybara-webkit/poltergeist)
  ActiveRecord::ConnectionAdapters::ConnectionPool.class_eval do
    def current_connection_id
      Thread.main.object_id
    end
  end

  def test_sign_in(user)
    controller.sign_in user
  end
end
