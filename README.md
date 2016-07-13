# simple-cms-blog
Simple CMS for managing blog content

Not yet completed(95%)

# Implementation

 - Framework : Express
 - Database : MongoDB
 - Template engine : Jade
 - Authentication : Passport
 - Editor : Summernote

# Installation

```bash
$ git clone git@github.com:irsyart/simple-cms-blog.git && cd ./simple-cms-blog
$ npm install
```

# Running
Make sure your mongodb service are running.

You can continue with:

```bash
$ npm start
```

Open `http://localhost:3000`

Sign up first to become an `Author`, go to Login menu on the top-right corner

# Some Information
 - All the published article will appear in home page and can be accessed without login but not editable.
 - Create `Category` first before posting an article, because it's required when posting new article.
 - Draft article will not appear in tagged articles and home page.

