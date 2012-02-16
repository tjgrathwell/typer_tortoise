class SnippetsController < ApplicationController
  def random
    render :text => Snippet.all.sample.full_text
  end
end
