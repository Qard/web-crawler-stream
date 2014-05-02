# streaming web cralwer example

This is a really basic example of how you can use streams to efficiently crawl
a the internet and map out links between pages. It has basic conditional link
following based on any found URLs, and it keeps track of what URLs it has seen.

I opted for a flat output, rather than a tree, to support streaming. It's also
more like the kind of structure you'd get creating records in a database.
Effectively, the url is the unique id.

## Pages

Each page is of the format

```js
{
  "url": "http://digitalocean.com",
  "links": ["http://digitalocean.com/mail","http://digitalocean.com/docs"],
  "assets": [
    {"type":"script","url":"http://digitalocean.com/app.js"},
    {"type":"link","url":"http://digitalocean.com/style.css"},
    {"type":"img","url":"http://digitalocean.com/logo.jpg"}
  ]
}
```