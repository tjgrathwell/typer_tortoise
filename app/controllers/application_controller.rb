class ApplicationController < ActionController::Base
  protect_from_forgery
  include SessionsHelper

  def index
  end
end
