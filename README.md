# Earlybird SDK for JavaScript

# Getting Started

## Install
TO DO
#### Frontend

You can either use a package manager like npm or include a `<script>` tag.

#### Node.js / React Native / Browserify / webpack

We are [browserify](http://browserify.org/)able and [webpack](http://webpack.github.io/) friendly.

```sh
npm install algoliasearch --save
```

#### Bower

TO DO

### Initialize the client

You first need to initialize the client. For that you need your **TRACKER KEY** and **DATASROUCE ID**.

```js
w.eb = new Eb();
w.eb.init('[TRACKER_KEY]');
var profile = {
    datasources: [{
        id: '[DATASOURCE_ID]'
    },
}
```
