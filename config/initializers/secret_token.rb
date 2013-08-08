# Be sure to restart your server when you modify this file.

# Your secret key for verifying the integrity of signed cookies.
# If you change this key, all old signed cookies will become invalid!
# Make sure the secret is at least 30 characters and all random,
# no regular words or you'll be exposed to dictionary attacks.
if Rails.env.test?
  # A not-so-great secret token to get Rails to chill out in test
  TyperTortoise::Application.config.secret_token = 'a' * 128
else
  TyperTortoise::Application.config.secret_token = ENV["secret_token"]
end
