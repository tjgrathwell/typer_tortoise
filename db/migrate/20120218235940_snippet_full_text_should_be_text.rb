class SnippetFullTextShouldBeText < ActiveRecord::Migration
  def change
    change_column('snippets', 'full_text', 'text', :limit => 2000)
  end
end
