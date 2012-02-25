class CreateCategoryPreferences < ActiveRecord::Migration
  def change
    create_table :category_preferences do |t|
      t.references :category
      t.references :user

      t.timestamps
    end
  end
end
