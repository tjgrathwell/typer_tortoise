# Be sure to restart your server when you modify this file.

SETTINGS = YAML.load(IO.read(Rails.root.join("config", "settings.yml")))

# Your secret key for verifying the integrity of signed cookies.
# If you change this key, all old signed cookies will become invalid!
# Make sure the secret is at least 30 characters and all random,
# no regular words or you'll be exposed to dictionary attacks.
TyperTortoise::Application.config.secret_token = SETTINGS["secret_token"]
