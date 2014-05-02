var concat = require('concat-stream')
var through = require('through2')
var trumpet = require('trumpet')
var request = require('request')
var parseUrl = require('url').parse
var dirname = require('path').dirname

module.exports = function (options) {
  options = options || {}
  options.delay || 500

  return through({ objectMode: true }, function (url, _, callback) {
    var stream = this

    // Reassign URL to a string, because we only need it in that format
    url = url.toString()
    var baseUrl = parseUrl(url)

    // Create an empty page definition
    var page = {
      url: url,
      links: [],
      assets: []
    }

    // Basic control flow to wait for all tasks to complete
    var pending = 0

    function wait () {
      pending++
    }

    function done () {
      pending--
      if (pending === 0) {
        stream.push(page)
        callback()
      }
    }

    // Parse data out of the url
    var tr = trumpet()

    // Listen for "a" elements and store the href
    tr.selectAll('a[href]', function (a) {
      wait()

      // Push the href attribute to the links list
      a.getAttribute('href', function (href) {
        // Ignore anchor URLs
        if (href === '#') {
          return done()
        }

        // Compensate for protocol-less URLs, both relative and absolute
        if ( ! /^\S+\:\/\//.test(href)) {
          if (href[0] === '/') {
            href = baseUrl.protocol + '//' + baseUrl.hostname + href
          } else if (/\.\S+$/.test(url)) {
            href = dirname(url) + '/' + href
          } else {
            href = url + '/' + href
          }
        }
        
        page.links.push(href)
        done()
      })
    })

    // Listen for various asset elements and store the type and href
    var assetTypes = ['img','script','link']
    assetTypes.forEach(function (type) {
      var attribute = type === 'link' ? 'href' : 'src'

      tr.selectAll(type + '[' + attribute + ']', function (a) {
        wait()

        // Push whatever url attribute is used to the assets list, with type
        a.getAttribute(attribute, function (url) {
          page.assets.push({
            type: type,
            url: url
          })
          done()
        })
      })
    })

    // Add an extra wait for the page completion event
    wait()

    // Catch errors or page completion
    tr.on('error', callback)
    tr.on('end', done)

    // Be a sensible web-citizen and wait between requests
    // Stream the url contents into the trumpet parser
    setTimeout(function () {
      request(url).pipe(tr)
    }, options.delay)
  })
}