TyperTortoise::Application.routes.draw do
  root 'application#index'

  get '/auth/:provider/callback' => 'sessions#create'
  get '/logout'                  => 'sessions#destroy'

  scope constraints: -> (request) { request.accepts.map(&:symbol).include?(:json) } do
    resources :scores, only: [:index, :create]

    resources :categories, :only => [:index] do
      post 'set_preferences', :on => :collection
    end

    resources :users, :only => [:index, :show] do
      get 'scores', :on => :member
    end

    resources :snippets, except: [:new, :edit] do
      get 'random', :on => :collection
    end
  end

  # Serve up the ember app for any other page and allow it to handle errors
  get '*path' => 'application#index', constraints: (lambda do |request|
    if Rails.env.development?
      # Allow helper paths like /rails/info to skip the catchall in development
      !request.path.start_with?('/rails/')
    else
      true
    end
  end)
end
