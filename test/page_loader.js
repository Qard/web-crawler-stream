var PageLoader = require('../page_loader')
var express = require('express')

function once (fn) {
  return function () {
    fn.apply(null, arguments)
    fn = function () {}
  }
}

describe('page_loader', function () {
  var testUrl = 'http://127.0.0.1:4567'

  before(function (done) {
    var app = express()
    
    app.get('/', function (req, res) {
      res.end([
        '<script src="http://example.com/app.js"></script>',
        '<script href="http://invalid.com/app.js"></script>',
        
        '<link href="http://example.com/style.css"></link>',
        '<link src="http://invalid.com/style.css"></link>',
        
        '<img src="http://example.com/img.jpg"></img>',
        '<img href="http://invalid.com/img.jpg"></img>',

        '<a href="http://google.com">Google</a>',
        '<a href="http://yahoo.com">Yahoo</a>',
        '<a src="http://invalid.com">invalid</a>'
      ].join(''))
    })

    app.listen(4567, done)
  })

  it('should create basic page item', function (done) {
    var loader = PageLoader({ delay: 1 })

    loader.on('data', function (page) {
      page.should.have.property('url', testUrl)
    })

    var fn = once(done)
    loader.on('error', fn)
    loader.on('end', fn)

    loader.write(testUrl)
    loader.end()
  })

  it('should find valid links', function (done) {
    var loader = PageLoader({ delay: 1 })

    loader.on('data', function (page) {
      page.should.have.property('links').with.lengthOf(2)
      page.links[0].should.equal('http://google.com')
      page.links[1].should.equal('http://yahoo.com')
    })

    var fn = once(done)
    loader.on('error', fn)
    loader.on('end', fn)

    loader.write(testUrl)
    loader.end()
  })

  it('should find valid assets', function (done) {
    var loader = PageLoader({ delay: 1 })

    loader.on('data', function (page) {
      page.should.have.property('assets').with.lengthOf(3)

      page.assets[0].should.have.property('type', 'script')
      page.assets[0].should.have.property('url', 'http://example.com/app.js')

      page.assets[1].should.have.property('type', 'link')
      page.assets[1].should.have.property('url', 'http://example.com/style.css')

      page.assets[2].should.have.property('type', 'img')
      page.assets[2].should.have.property('url', 'http://example.com/img.jpg')
    })

    var fn = once(done)
    loader.on('error', fn)
    loader.on('end', fn)

    loader.write(testUrl)
    loader.end()
  })

  it('should support delayed loading', function (done) {
    var loader = PageLoader({ delay: 500 })
    var start = Date.now()

    loader.on('data', function (page) {
      Date.now().should.be.above(start + 500)
    })

    var fn = once(done)
    loader.on('error', fn)
    loader.on('end', fn)

    loader.write(testUrl)
    loader.end()
  })
})