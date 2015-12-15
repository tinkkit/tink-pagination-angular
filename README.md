# Tink pagination Angular directive

v1.0.1

## What is this repository for?

The Tink Angular pagination provides with a table on steroids.

Tink is an in-house developed easy-to-use front-end framework for quick prototyping and simple deployment of all kinds of websites and apps, keeping a uniform and consistent look and feel.

## Setup

### Prerequisites

* nodeJS [http://nodejs.org/download/](http://nodejs.org/download/)
* bower: `npm install -g bower`

### Install

1. Go to the root of your project and type the following command in your terminal:

   `bower install tink-pagination-angular --save`

2. Add the following files to your project:

   `<link rel="stylesheet" href="bower_components/tink-core/dist/tink.css" />` (or one of the Tink themes)

   `<script src="bower_components/tink-pagination-angular/dist/tink-pagination-angular.js"></script>`

   `<script src="bower_components/ng-lodash/build/ng-lodash.js"></script>`

   `<script src="bower_components/tink-helper-safe-apply-angular/dist/tink-helper-safe-apply-angular.js"></script>`


3. Add `tink.pagination` to your app module's dependency.

   `angular.module('myApp', ['tink.pagination']);`



----------



## How to use

### Example

```html
<tink-pagination  tink-current-page="ct.nums" tink-change="changed(page,perPage,next)" tink-total-items="ct.totalitems" tink-items-per-page="ct.numpp"></tink-pagination>
```

### Options

Attr | Type | Default | Details
--- | --- | --- | ---
data-tink-pagination-id (required) | `string` | `''` | An id that specifies to which table it belongs.
tink-current-page (required) | `number` | `undefined` | The number of the current page.
tink-total-items (required) | `number` | `undefined` | Total number of items you want to show.
tink-items-per-page (required) | `number` | `undefined` | How many items you want to show!
tink-items-per-page-values (required) | `array` | `undefined` | Array of numbers that will be shown as per page value.
tink-change(page,perPage,next) (required) | `Function` | `undefined` | The functie that will be called if you change a page or perPage Items.


### Script example

> If you want to cancel the loading icon use the next function.

```javascript
scope.changed = function(page,perPage,next){
  next();
}
```

```javascript
scope.changed = function(change,next){
  /* change will give you an  object if the page or peerage is changed.
  * {type:'page',value:2}
  * {type:'perPage',value:20}
  * If you do not change the data ! use next();
  */
}
```

----------


## Contribution guidelines

* If you're not sure, drop us a note
* Fork this repo
* Do your thing
* Create a pull request

## Who do I talk to?

* Jasper Van Proeyen - jasper.vanproeyen@digipolis.be - Lead front-end
* Tom Wuyts - tom.wuyts@digipolis.be - Lead UX
* [The hand](https://www.youtube.com/watch?v=_O-QqC9yM28)
