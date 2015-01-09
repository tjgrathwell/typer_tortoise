#!/usr/bin/env rake
# Add your own tasks in files placed in lib/tasks ending in .rake,
# for example lib/tasks/capistrano.rake, and they will automatically be available to Rake.

require File.expand_path('../config/application', __FILE__)

TyperTortoise::Application.load_tasks

if Rake::Task.task_defined?(:default)
  Rake::Task['default'].enhance do
    Rake::Task['jasmine:ci'].invoke
  end
end