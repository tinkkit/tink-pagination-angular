# Tink interactive table Angular directive

v1.0.0

## What is this repository for?

The Tink Angular interactive table provides with a table on steroids.

Tink is an in-house developed easy-to-use front-end framework for quick prototyping and simple deployment of all kinds of websites and apps, keeping a uniform and consistent look and feel.

## Setup

### Prerequisites

* nodeJS [http://nodejs.org/download/](http://nodejs.org/download/)
* bower: `npm install -g bower`

### Install

1. Go to the root of your project and type the following command in your terminal:

   `bower install tink-interactive-table-angular --save`

2. Add the following files to your project:

   `<link rel="stylesheet" href="bower_components/tink-core/dist/tink.css" />` (or one of the Tink themes)

   `<script src="bower_components/tink-interactive-table-angular/dist/tink-interactive-table-angular.js"></script>`

   `<script src="bower_components/ng-lodash/build/ng-lodash.js"></script>`

   `<script src="bower_components/Sortable/Sortable.js"></script>`

   `<script src="bower_components/tink-popover-angular/dist/tink-popover-angular.js"></script>`

   `<script src="bower_components/tink-helper-safe-apply-angular/dist/tink-helper-safe-apply-angular.js"></script>`

   `<script src="bower_components/tink-tooltip-angular/dist/tink-tooltip-angular.js"></script>`

   `<script src="bower_components/tink-sort-table-angular/dist/tink-sort-table-angular.js"></script>`

3. Add `tink.interactivetable` to your app module's dependency.

   `angular.module('myApp', ['tink.interactivetable']);`



----------



## How to use

### Example

```html
<tink-interactive-table tink-checked="boxChecked($data,$checked)" tink-loading="ct.loading" tink-headers="headers" tink-data="data.content" tink-actions="actions" tink-empty-message="Geen resultaten">
 <table>
    <thead>
      <tr>
        <th ng-repeat="view in tinkHeaders" tink-sort-header="{{ view.sort }}">{{ view.alias }}</th>
      </tr>
    </thead>
    <tbody>
      <tr ng-click="$parent.$parent.load()" ng-repeat="view in tinkData">
        <td>{{ view.firstname | date:'dd/MM/yyyy' }}</td>
        <td>{{ view.lastname }}</td>
        <td>{{ view.username }}</td>
      </tr>
    </tbody>
  </table>

  <tink-pagination  tink-current-page="$parent.ct.nums" tink-change="$parent.changed(type,value,next)" tink-total-items="$parent.ct.totalitems" tink-items-per-page="$parent.ct.numpp"></tink-pagination>
</tink-interactive-table>
```

### Options

Attr | Type | Default | Details
--- | --- | --- | ---
data-ng-model (required) | `array` | `undefined` | The table info that needs to be shown.
data-tink-headers (required) | `array` | `undefined` | The header information for each column.
data-tink-actions (required) | `array` | `undefined` | When present checkboxes will appear to do some predefined actions with it.
data-tink-checked | `function($data,$checked)` | `undefined` | will be called when you check a checkbox.
data-tink-show-checkboxes | `Boolean` | `true` | If true the table will add a column with checkboxes, even if there are no actions defined.
data-tink-loading | `Boolean` | `false` | If true the table will have a loading icon and rows won't be clickable.
data-tink-empty-message | `string` | `''` | This will the message that will be shown when there is no data.
data-tink-force-responsive | `Boolean` | `false` | This will add a responsive wrapper class (`.table-force-responsive`) when true.

### Script example

```javascript
scope.data = [
  {
    firstname: 'Jasper',
    lastname: 'Van Proeyen',
    username: '@trianglejuice'
  },
  {
    firstname: 'Tom',
    lastname: 'Wuyts',
    username: '@pxlpanic'
  },
  {
    firstname: 'Kevin',
    lastname: 'De Mulder',
    username: '@clopin'
  },
  {
    firstname: 'Vincent',
    lastname: 'Bouillart',
    username: '@BouillartV'
  }
];
```

> If you want to **hide a column** (initially) give its header a property `checked` with the value `false`.
> If you want to **give the column a different name in the column sorter** give its header a property `sortalias` with the desirable value.
> If you want to **sort a column** refer to the [Tink sort table documentation](https://github.com/tinkkit/tink-sort-table-angular).

```javascript
scope.headers = [
  {
    field: 'firstname',
    alias: 'Voornaam',
    sort: 'firstname',
    checked: true, //to show this header or not required
    disabled:true, // can't change the checked value
  },
  {
    field: 'lastname',
    alias: 'Achternaam',
    sort: 'lastname',
    checked: false
  },
  {
    field: 'username',
    alias: 'Gebruikersnaam',
    sortalias: 'User'
    sort: '',
    checked: true
  }
];
```

> To **add an action** create an array with objects with a `name` property and a `callback` function. This callback function will be called when this action is used. The function will give you an array of items that is selected. The function will also give you a function as a parameter to uncheck all the checkboxes.

```javascript
scope.actions = [
  {
    name: 'remove',
    callback: function(items) {
      angular.forEach(items, function(val) {
        scope.data.content.splice(scope.data.content.indexOf(val), 1);
      });
    },
    master: true, // Whether it's a main action or not. Required.
    icon: 'fa-close', // The (Font Awesome) icon. Required.
    order: 0, // If you want to customize the order
    single: true, // Indicates that the action is only available when one row is checked. Defaults to false.
    checkedAll: false // Indicates that the action is only available when all rows are checked. Defaults to false.
    alwaysEnabled: true // Indicates that the action is always available, even if no row is checked. Defaults to false.
    alwaysDisabled: true // Indicates that the action is never available, even if all rows are checked. Defaults to false.
    notSmall:true, //Works in combination with alwaysEnabled to show the buttons with text and not with a tooltip.
  }
];
```



----------



## Tink pagination

See the top-most example for how to implement pagination.

### Options

Attr | Type | Default | Details
--- | --- | --- | ---
data-tink-pagination-id (required) | `string` | `''` | An id that specifies to which table it belongs.
tink-current-page (required) | `number` | `undefined` | The number of the current page.
tink-total-items (required) | `number` | `undefined` | Total number of items you want to show.
tink-items-per-page (required) | `number` | `undefined` | How many items you want to show!
tink-items-per-page-values (required) | `array` | `undefined` | Array of numbers that will be shown as per page value.
tink-change | `function` | `undefined` | To receive information if the pagination or perPage value change!


```javascript
scope.changed = function(change,next){
  /* change will give you an  object if the page or peerage is changed.
  * {type:'page',value:2}
  * {type:'perPage',value:20}
  * If you do not change the data ! use next();
  */
}
```

## Contribution guidelines

* If you're not sure, drop us a note
* Fork this repo
* Do your thing
* Create a pull request

## Who do I talk to?

* Jasper Van Proeyen - jasper.vanproeyen@digipolis.be - Lead front-end
* Tom Wuyts - tom.wuyts@digipolis.be - Lead UX
* [The hand](https://www.youtube.com/watch?v=_O-QqC9yM28)
