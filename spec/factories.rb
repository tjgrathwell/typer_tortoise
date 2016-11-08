FactoryGirl.define do
  factory :user do
    sequence :name do |n|
      "Test User #{n}"
    end
  end

  factory :category do
    sequence :name do |n|
      "test_snippet_category_#{n}"
    end
  end

  factory :snippet do
    category
    sequence :full_text do |n|
      "lorem ipsum dolor #{n}"
    end
  end

  factory :score do
    snippet
    user
    wpm 88
    accuracy 51.2
  end

  factory :category_preference do
    category
    user
  end
end
