class CreateUserValues < ActiveRecord::Migration
  def change
    create_table :user_values do |t|
      t.text :values
    end
  end
end
