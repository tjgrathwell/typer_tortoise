class CreateScores < ActiveRecord::Migration
  def change
    create_table :scores do |t|
      t.integer :wpm
      t.float :accuracy

      t.references :snippet
      t.references :user

      t.timestamps
    end
  end
end
