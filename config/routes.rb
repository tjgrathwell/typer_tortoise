TyperTortoise::Application.routes.draw do
  get '/auth/:provider/callback' => 'sessions#create'
  get '/logout'                  => 'sessions#destroy'

  json_constraint = lambda do |request|
    request.accepts.map(&:to_s).any? { |type| type.match(/json/) }
  end

  scope constraints: json_constraint do
    resources :scores, only: [:index, :create]

    resources :categories, only: [:index] do
      post :set_preferences, on: :collection
    end

    resources :users, only: [:index, :show] do
      get :scores, on: :member
    end

    resources :snippets, except: [:new, :edit] do
      get :random, on: :collection
    end
  end

  mount_ember_app :frontend, to: "/"
end
