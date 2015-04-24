class ParamChecker
  def initialize(method)
    @method = method
  end

  def force_integers!(*values)
    values.each do |value|
      validate_iterable!(value)
      validate_integers!(value)
      value.map!(&:to_i)
    end
  end

  def validate_integers!(value)
    value.each do |id|
      unless id.to_s.match(/^\d+$/)
        raise ArgumentError, "Arguments to #@method must be numeric, '#{id.inspect}' isn't."
      end
    end
  end

  def validate_iterable!(value)
    unless value.respond_to? :each
      raise ArgumentError, "Arguments to #@method must be iterable, '#{value}' isn't."
    end
  end
end