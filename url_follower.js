const through = require('through2')

module.exports = function (newUrls, matcher) {
  matcher = matcher || function () { return true }
  var seen = {}

  return through({ objectMode: true }, function (page, _, done) {
    seen[page.url] = true

    // Push every new url back to the newUrls stream
    if (page.links && page.links.length) {
      page.links.forEach(function (url) {
        if ( ! seen[url] && matcher(url)) {
          seen[url] = true
          newUrls.write(url)
        }
      })
    }

    // Passthrough page as-is
    this.push(page)
    done()
  })
}