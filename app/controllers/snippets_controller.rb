class SnippetsController < ApplicationController
  def random
    all_snips = Snippet.all
    selected_snip = nil
    if (all_snips.length > 0)
      selected_snip = all_snips.sample
    else
      raise
    end

    respond_to do |format|
      format.json { render :json => selected_snip.to_json }
      format.html { render :text => selected_snip.full_text }
    end    
  end
end
