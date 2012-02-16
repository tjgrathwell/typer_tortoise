class ApplicationController < ActionController::Base
  protect_from_forgery

  def index
  end

  def snippet
    ipsum_snips = [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec nibh mi. Praesent vel lacus tortor, ut tempus sapien.',
      'Donec auctor, mauris ac tincidunt convallis, nulla dolor ultricies nisi, et aliquam erat felis vitae nulla. Nam a lacus turpis. Ut tristique massa eget orci bibendum posuere.',
      'This is the third sample it is in english.',
    ];

    some_snips = [
      "Now, this plan of Queequeg's, or rather Yojo's, touching the selection of our craft; I did not like that plan at all.",
      "In thoroughfares nigh the docks, any considerable seaport will frequently offer to view the queerest looking nondescripts from foreign parts.",
      "No town-bred dandy will compare with a country-bred one - I mean a downright bumpkin dandy - a fellow that, in the dog-days, will mow his two acres in buckskin gloves for fear of tanning his hands.",
    ]
    code_snips = [<<eos]
if (condition) {
  puts "hello world"
}
eos
    render :text => code_snips.sample
  end
end
