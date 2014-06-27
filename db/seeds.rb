# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

snip_files = Dir.glob('./db/snippets/*.snp')

snip_files.each do |filename|
  category = filename.match('(\w+)\.snp')[1]

  contents = File.read(filename)
  snippets = contents.split('|||||=====|||||')
  snippets.each do |snippet|
    # remove "comments"
    snippet = snippet.split("\n").select { |line| line !~ /^ZZ/ }.join("\n")

    if snippet =~ /\t/
      raise "No tabs allowed in the snippet seeds (#{filename}):\n#{snippet}\n"
    end

    Snippet.find_or_create_by_full_text({
      category_id: Category.find_or_create_by_name(category).id,
      full_text: snippet.strip
    })
  end
end
