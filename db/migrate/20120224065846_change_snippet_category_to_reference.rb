class ChangeSnippetCategoryToReference < ActiveRecord::Migration
  def up
    change_table :snippets do |t|
      t.references :category
    end

    Snippet.all.each do |snippet|
      snippet.update_attributes(:category_id => Category.find_by_name(snippet.category).id)
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
