class SnippetFullTextShouldBeText < ActiveRecord::Migration
  def change
    change_column(:snippets, :full_text, :text, :limit => nil)
  end
end
