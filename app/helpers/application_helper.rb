module ApplicationHelper
  def root_path
    '/'
  end

  def favicon_file
    if Rails.env.development?
      'turtle-icon-small-inverted.ico'
    else
      'turtle-icon-small.ico'
    end
  end
end
