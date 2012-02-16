# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

Snippet.create({
  category: 'ruby',
  short_desc: 'boring if statement',
  full_text: <<eos
if (condition) {
  puts "hello world"
}
eos
});

Snippet.create({
  category: 'ruby',
  short_desc: 'boring each statement',
  full_text: <<eos
things.each do |thing|
  thing.bleep_bloop
end
eos
});
