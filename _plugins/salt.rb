module Jekyll
  module Drops
    class UrlDrop < Drop
      def salt
        Digest::MD5.hexdigest(@obj.basename_without_ext)[0...6]
      end
    end
  end
end