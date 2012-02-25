class CreateCategories < ActiveRecord::Migration
  def up
    create_table :categories do |t|
      t.string :name

      t.timestamps
    end

    Snippet.all.each do |snippet|
      Category.find_or_create_by_name(snippet.category)
    end
  end

  def down
    drop_table :categories
  end
end
