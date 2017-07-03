# Earlybird SDK for JavaScript

### Documentation API

See the [Earlybirds doc](doc.early-birds.fr).

## Installation

To install the library, just paste the following code into the <head> section of your HTML page.
```js
<script>
  (function () {
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = 'http://xxx.com/sdk.js';
    var x = document.getElementsByTagName('script')[0];
    x.parentNode.insertBefore(s, x);
  })();
</script>
```
    
## init()

First, you need to initialize the client with a **TRACKER KEY**.

```js
w.eb = new Eb();
w.eb.init('[TRACKER_KEY]');
```

## identify(profile)
Then, you need to identify the user by providing a profile object with at least a **datasources** key.

```js
const profile = {
  datasources: [{
      id: '[DATASOURCE_ID]'
  }]
}
w.eb.identify(profile);
```

## trackActivity(options)

Track an activity with the givens options.

```js
  w.eb.trackActivity({
    original_id: '[XX]',
    quantity: '[QUANTITY]',
    price: '[PRICE]',
    verb: '[view | add-to-cart | buy | like | disklike | click-on-reco]'
  })
```
