# Be sure to restart your server when you modify this file.

# Your secret key for verifying the integrity of signed cookies.
# If you change this key, all old signed cookies will become invalid!
# Make sure the secret is at least 30 characters and all random,
# no regular words or you'll be exposed to dictionary attacks.
if Rails.env.production?
  TyperTortoise::Application.config.secret_key_base = ENV["secret_token"]
else
  # A not-so-great secret token to get Rails to chill out in dev/test
  TyperTortoise::Application.config.secret_key_base = 'a' * 128
end
