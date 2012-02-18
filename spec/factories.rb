FactoryGirl.define do
  factory :user do
    name     "Robert Typesmith"
  end

  factory :snippet do
    short_desc     "a_test_snippet"
    full_text      "lorem ipsum dolor etc"
    category       "test_cat"
  end
end
