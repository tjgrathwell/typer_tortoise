require 'rails_helper'

describe 'routing to rails builtin routes' do
  let(:rails_info_path) { '/rails/info' }

  context 'in development' do
    before do
      allow(Rails.env).to receive(:development?).and_return(true)
    end

    it 'does not use the catch-all route' do
      expect(get: rails_info_path).not_to be_routable
    end
  end

  context 'in non-development envs' do
    it 'uses the normal catch-all route' do
      expect(get: rails_info_path).to route_to(
                                      controller: "application",
                                      action: "index",
                                      path: "rails/info"
                                    )
    end
  end
end