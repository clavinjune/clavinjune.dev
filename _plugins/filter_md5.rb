module FilterMD5
  def md5(input, n=6)
    Digest::MD5.hexdigest(input.strip + input.strip[0..2])[0...n]
  end
end

Liquid::Template.register_filter(FilterMD5)