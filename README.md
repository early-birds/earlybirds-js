# Earlybird SDK for JavaScript

Earlybirds Javascript is a wrapper for the Earlybirds API.
It includes functions that allows you to trigger an identify, get some recommandations, and track activities.

## Installation

```
npm install earlybirds-js
```

## Requirements

This tutorial requires a basic understanding of the Earlybids API and we strongly recommend you to read the [Earlybirds doc](doc.early-birds.fr) first.

## Getting started

### Initializing
First, we need to initialize the instance with a trackerKey using the init() method.
```js
import Eb from 'earlybirds-js'

const eb = new Eb().getInstance()
eb.init('TRACKER_KEY')
```
### Get a profile ID 
Every time a user visits your page, you need to send an identify request to the API in order to retrieve his Earlybirds profile ID. See the [Earlybirds doc (identify workflow)](http://doc.early-birds.fr/images/identify.png).

```js
const config = {
    profile: {
        datasources: [{
            id: 'DATASOURCE_ID',
            original_id: 'CUSTOMER_ID'
        }]
    }
}
eb.identify(config)
```

### Get recommendations
Earlybirds-js provides a getRecommendations method that takes a widgetId as parameter
and return a promise that resolves to a list of recommendations

```js
eb.getRecommendations('WIDGET_ID')
.then(recommendations => {
  // ok
})
```

### Track an activity
The trackActivity method allows you to track actions such as a view, a buy, ...
Can be done anywhere after an identify
```js
eb.trackActivity({
  original_id: '[ORIGINAL_ID]',
  quantity: '[QUANTITY]',
  price: '[PRICE]',
  verb: '[view | add-to-cart | buy | like | disklike | click-on-reco]'
})
```

### Get Recommendations for a cluster
If the Early Birds profileId is not known, you can replace it with the couple datasourceId / userId.
```js
eb.getRecosForCluster('WIDGET_ID', 'CLUSTER_ID')
```

### Get recos multi
Retrieve results from several recommendation widgets.
```js
eb.getRecommendationsMulti('WIDGET_IDS')
```

### Get Last activities
You can retrieve the list of user last activities, filtered by any verb.

Usage example:

- Retrieve last products liked

- Retrieve last items seen

- Retrieve last buys

```js
eb.getActivities('WIDGET_IDS', 'VERB')
```

## Run the tests
Tests are made using Jest
```bash
npm run test
```
### See also
##### Documentation API : [Earlybirds doc](doc.early-birds.fr).
