var UrlFollower = require('../url_follower')
var through = require('through2')

describe('url_follower', function () {
  var testUrl = 'http://google.com'
  var stream

  beforeEach(function () {
    stream = through()
  })

  it('should push urls back', function (done) {
    var urlFollower = UrlFollower(stream)

    stream.on('data', function (received) {
      received.toString().should.equal(testUrl)
    })

    stream.on('error', done)
    stream.on('end', done)

    urlFollower.write({
      url: 'test',
      links: [testUrl]
    })
    urlFollower.end()
    stream.end()
  })

  it('should not push seen urls back', function (done) {
    var urlFollower = UrlFollower(stream)
    var count = 0

    stream.on('data', function () {
      count++
    })

    stream.on('error', done)
    stream.on('end', function () {
      count.should.equal(1)
      done()
    })

    urlFollower.write({
      url: 'test',
      links: [testUrl]
    })
    urlFollower.end()
    stream.end()
  })

  it('should include page url in seen list', function (done) {
    var urlFollower = UrlFollower(stream)
    var count = 0

    stream.on('data', function () {
      count++
    })

    stream.on('error', done)
    stream.on('end', function () {
      count.should.equal(0)
      done()
    })

    urlFollower.write({
      url: testUrl,
      links: [testUrl]
    })
    urlFollower.end()
    stream.end()
  })

  it('should use only push back URLs that pass matcher function', function (done) {
    var urlFollower = UrlFollower(stream, function (url) {
      return /google\.com/.test(url)
    })
    var count = 0

    stream.on('data', function () {
      count++
    })

    stream.on('error', done)
    stream.on('end', function () {
      count.should.equal(2)
      done()
    })

    urlFollower.write({
      url: 'test',
      links: [
        'http://google.com',
        'http://www.google.com',
        'http://goo.gl'
      ]
    })
    urlFollower.end()
    stream.end()
  })
})