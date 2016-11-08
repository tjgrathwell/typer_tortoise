def sign_in_with_twitter_as(user)
  Identity.create(
    user_id: user.id,
    provider: 'twitter',
    uid: '12345'
  )

  OmniAuth.config.test_mode = true
  OmniAuth.config.add_mock(:twitter, uid: '12345')

  visit '/auth/twitter'
end
