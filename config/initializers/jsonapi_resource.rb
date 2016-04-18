JSONAPI.configure do |config|
  config.resource_key_type = :integer
end

# Monkey patch to try to ensure all links are built as 'nil'
# Maybe reconsider this once the gem is released with less hacky
# custom_links support from this commit:
# https://github.com/cerebris/jsonapi-resources/commit/4defb2adc8ca6466fdb307f05c198c21769b0639
module JSONAPI
  class ResourceSerializer
    def generate_link_builder(primary_resource_klass, options)
      FakeLinkBuilder.new(
        base_url: options.fetch(:base_url, ''),
        route_formatter: options.fetch(:route_formatter, JSONAPI.configuration.route_formatter),
        primary_resource_klass: primary_resource_klass,
      )
    end
  end

  class FakeLinkBuilder < LinkBuilder
    def query_link(query_params)
      nil
    end

    def relationships_related_link(source, relationship, query_params = {})
      nil
    end

    def relationships_self_link(source, relationship)
      nil
    end

    def self_link(source)
      nil
    end
  end
end
