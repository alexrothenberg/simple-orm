# Simple-ORM.js

ActiveRecord is an awesome pattern to let you work with objects and avoid writing SQL even when 
storing data in a relational database.  This library lets you work with the browser's 
[Web SQL API](http://docs.phonegap.com/en/1.2.0/phonegap_storage_storage.md.html) 
(not officially a part of HTML5 [anymore](http://dev.w3.org/html5/webdatabase/) but in browsers)

## Examples ##

### Defining your `model` object

```javascript
Article = new Model.Base('articles', ['title', 'content']);
```    

A database table is automatically created when the model is defined (sort of like a Rails migration)

### Creating an object

```javascript
Article.create({
  id: 17,
  title: 'A good Article', 
  content: 'This is about lots of stuff...'
})
```    

### Finding an object

```javascript
article = Article.find(17)
// we do not yet know whether the article exists because the sql call is asynchronous

// article is a "promise" that will tell us when it is ready
article.done(function() {
  if (article.id) {
    // Found the article.  article.title == 'A good Article'
  } else {
    // No article with id 17 exists
  }
})
```    

### Get list of all objects

```javascript
articles = Article.all()
// articles == [] because the sql call is asynchronous

// articles is a "promise" that will tell us when it is filled in
articles.done(function() {
  // Now the articles are there and we can do something
})
```    

### Delete all objects

```javascript
Article.delete_all()
```    


## Thanks ##

Thanks to Ruby on Rails and its ActiveRecord pattern for inspriing me to bring this small piece to javascript.

## Want to help? ##

Please do! 

Create an [issue](https://github.com/alexrothenberg/simple-orm/issues), 
submit a pull request
or just let me know what you think [@alexrothenberg](http://www.twitter.com/alexrothenberg)

## Legal ##

[Licensed under the MIT license](http://www.opensource.org/licenses/mit-license.php)
