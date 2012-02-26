class ChangeSnippetCategoryToReference < ActiveRecord::Migration
  def up
    change_table :snippets do |t|
      t.references :category
    end

    remove_column :snippets, :category
  end

  def down
    change_table :snippets do |t|
      t.remove_references :category
    end

    add_column :snippets, :category, :string
  end
end
