TyperTortoise::Application.routes.draw do
  root 'application#index'

  get '/auth/:provider/callback' => 'sessions#create'
  get '/logout'                  => 'sessions#destroy'

  resources :scores, only: [:index, :create]

  resources :categories, :only => [:index] do
    post 'set_preferences', :on => :collection
  end

  resources :users, :only => [:show] do
    get 'scores', :on => :member
  end

  scope format: true, constraints: {format: 'json'} do
    resources :users, :only => [:index, :show] do
      get 'scores', :on => :member
    end

    resources :snippets, except: [:new, :edit] do
      get 'random', :on => :collection
    end
  end

  get '/users' => 'application#only_layout'
  get '/snippets' => 'application#only_layout'
  get '/snippets/*path' => 'application#only_layout'
end
