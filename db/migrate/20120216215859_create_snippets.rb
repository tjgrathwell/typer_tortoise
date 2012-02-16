class CreateSnippets < ActiveRecord::Migration
  def change
    create_table :snippets do |t|
      t.string :full_text
      t.string :category
      t.string :short_desc

      t.timestamps
    end
  end
end
