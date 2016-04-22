class ApplicationController < ActionController::Base
  protect_from_forgery
  include SessionsHelper

  def index
  end

  private

  def extracted_attributes(*attributes)
    dashy_attributes = attributes.map(&:to_s).map(&:dasherize)
    param_attrs = params.require(:data).require(:attributes).permit(dashy_attributes)

    attributes.each_with_object({}) do |attr, hsh|
      hsh[attr] = param_attrs[attr.to_s.dasherize]
    end
  end

  def relationship_attribute(model_name, attribute)
    params
      .require(:data)
      .require(:relationships)
      .require(model_name)
      .require(:data)
      .permit([attribute])[attribute.to_s]
  end
end
