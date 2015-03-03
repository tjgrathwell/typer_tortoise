class ApplicationController < ActionController::Base
  protect_from_forgery
  include SessionsHelper

  def only_layout
    render html: '', layout: true
  end
end
