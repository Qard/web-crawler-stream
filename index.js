var fs = require('fs')
var through = require('through2')
var JSONStream = require('JSONStream')
var PageLoader = require('./page_loader')
var urlFollower = require('./url_follower')

// Stream to push URLs to
var urlStream = through()

// Transforms URLs to page models
var loader = PageLoader({
  delay: 500 // 500ms delay between page requests, to be a good web citizen
})

// Passthrough stream that tracks URLs of received pages
// and conditionally sends new links back to the url stream
var cache = urlFollower(urlStream, function (url) {
  return /^\S+\:\/\/digitalocean\.com/.test(url)
})

// Use JSONStream to serialize the data stream to json strings
var stringify = JSONStream.stringify()

// Write the output json strings to a json file
var outputFile = fs.createWriteStream('output.json')

// Pipeline urls -> loader -> new page tracker -> serializer -> output file
urlStream.pipe(loader).pipe(cache).pipe(stringify).pipe(outputFile)

// Start the sequence
urlStream.push('http://digitalocean.com/')