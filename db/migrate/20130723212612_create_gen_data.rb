class CreateGenData < ActiveRecord::Migration
  def change
    create_table :gen_data do |t|
      t.string :state
      t.boolean :present
      t.text :data
      t.string :description

      t.timestamps
    end
  end
end
