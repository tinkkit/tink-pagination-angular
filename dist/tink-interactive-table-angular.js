'use strict';
(function(module) {
  try {
    module = angular.module('tink.interactivetable');
  } catch (e) {
    module = angular.module('tink.interactivetable', ['tink.popover','tink.sorttable','tink.tooltip','tink.safeApply']);
  }
  module.directive('tinkInteractiveTable',[function(){
    return{
      restrict:'EA',
      priority: 1500.1,
      replace:true,
      compile: function compile(tElement, tAttrs) {
        $(tElement.find('thead tr')[0]).prepend($('<th ng-if="(hasActions() && NotAllActionsAreVisibleAllTheTime()) || tinkShowCheckboxes" class="has-checkbox"><div class="checkbox"><input type="checkbox" ng-click="checkAll($event)" ng-class="{indeterminate:true}"  ng-checked="checked().length === tinkData.length" indeterminate id="{{$id}}-all" name="{{$id}}-all" value=""><label for="{{$id}}-all"></label></div></th>'));
        var td = $('<td ng-show="(hasActions() && NotAllActionsAreVisibleAllTheTime()) || tinkShowCheckboxes" ng-click="prevent($event)"><input type="checkbox" ng-change="checkChange(tinkData[$index])" ng-model="tinkData[$index].checked" id="{{$id}}-{{$index}}" name="{{$id}}-{{$index}}" value=""><label for="{{$id}}-{{$index}}"></label></td>');
        $(tElement.find('tbody tr')[0]).prepend(td);
        $(tElement.find('tbody')[0]).append('</tr><tr ng-show="!tinkLoading && (tinkData.length === 0 || tinkData === undefined || tinkData === null)"><td colspan="{{tinkHeaders.length+1}}">{{tinkEmptyMessage}}</td></tr>`');
        $(tElement.find('thead tr')[0]).find('th').each(function(index){
            if(index>0){
             $(this).attr('ng-if','tinkHeaders[$index].checked');
            }
          });

        tAttrs._tr = $(tElement.find('tbody tr')).clone();
        tAttrs._th = $(tElement.find('thead tr')).clone();
        return {
          post:function postLink(scope,attr){
            scope._tr = attr._tr;
          }
        };
      }
    };
  }]);
    module.controller('interactiveCtrl', ['$scope','$attrs','$element','$compile', function($scope,$attrs,$element,$compile) {
        var ctrl = this;

        ctrl.replaceBody = function(){
          //find the tbody and thead
          var tbody = $element.find('tbody');
          var thead = $element.find('thead');
          //clean the content
          tbody.html('');
          thead.html('');

          //add the needed class to the table
          $element.find('table').addClass('table-interactive');

         //clone the tr and th's we retrieved at the beginning (so the original wont be compiled)
         var trClone = $attrs._tr.clone();
         var thClone = $attrs._th.clone();

         //add the clones
         tbody.append(trClone);
         thead.append(thClone);

          tbody.find('tr:first td').each(function(index){
            if(index>0){
              if($scope.tinkHeaders[(index-1)]){
                $(this).attr('ng-if','tinkHeaders['+(index-1)+'].checked');
              }
            }
          });

        //compile the tbody and thead
          $compile(trClone)($scope);
          $compile(thClone)($scope);
        };

        $scope.prevent = function($event){
          $event.stopPropagation();
        };

        ctrl.changeColumn = function(a,b){
          a+=1;
          b+=1;
          ctrl.swapTds(a,b);
          ctrl.replaceBody($attrs._tr);
        };

        ctrl.swapTds = function(a,b){
          var td1 = $attrs._tr.find('td:eq('+a+')'); // indices are zero-based here
          var td2 = $attrs._tr.find('td:eq('+b+')');
          if(a < b){
            td1.detach().insertAfter(td2);
          }else if(a > b){
            td1.detach().insertBefore(td2);
          }
        };
      }]);
  module.directive('tinkInteractiveTable',['$compile','$rootScope','safeApply','$filter',function($compile,$rootScope,safeApply,$filter){
    return{
      restrict:'EA',
      transclude:true,
      priority: 1500,
      replace:true,
      scope:{
        tinkData:'=',
        tinkHeaders:'=',
        tinkActions:'=',
        tinkAllowColumnReorder:'=',
        tinkLoading:'=',
        tinkEmptyMessage:'@',
        tinkForceResponsive:'=',
        tinkChecked:'&',
        tinkShowCheckboxes:'='
      },
      controller:'interactiveCtrl',
      templateUrl:'templates/interactive-table.html',
      compile: function compile() {

        return {
          post: function postLink(scope, iElement, iAttrs, controller) {

            scope.forceResponsive = function(){
              if(scope.tinkForceResponsive === true || scope.tinkForceResponsive === 'true'){
                return true;
              }
              return false;
            };

            if(scope.forceResponsive()) {
              iElement.find('table').wrap('<div class="table-force-responsive"></div>');
            }

            //compile all the stuff to get scope of interactive table
            $compile($(iElement.children()[1]).children())(scope);
            //change the content
            controller.replaceBody();

            /*stuff actions*/
            scope.actionConf = {};

            var breakpoint = {};
            //this function will see wich type of view we are
            breakpoint.refreshValue = function () {
              var screenSize = window.getComputedStyle(document.querySelector('body'), ':before').getPropertyValue('content').replace(/\'/g, '').replace(/\"/g, '');
              // if(screenSize !== 'widescreen-view'){
              //   scope.actionConf.tekst = false;
              // }else{
              //   scope.actionConf.tekst = true;
              // }
              if(screenSize === 'phone-view' || screenSize === 'tablet-view'){
                scope.actionConf.menu = true;
              }else{
                scope.actionConf.menu = false;
              }
            };

            //on resize check wich view we are
            $(window).resize(function () {
              safeApply(scope,function(){
                breakpoint.refreshValue();
              });
            });
            //when the directive start check for new view
            breakpoint.refreshValue();

            //watch on the tinkLoading
            scope.$watch('tinkLoading',function(newV){
              if(newV){
                iElement.find('table').addClass('is-loading');
               }else{
                iElement.find('table').removeClass('is-loading');
               }
            });


            /*end actions*/
            scope.selected = {value :-1};
            //If you select an other kolom name in de kolumn popup this function will be fired.
            scope.select = function(e,index){
              //Prevent the default to disable checkbox behaviour.
              e.preventDefault();
              //Changed the selected index.
              scope.selected.value = index;
            };
            scope.allChecked = false;

            function getDataWithNoAlwaysEnabledButtons(master){
              var data = [];
                for (var i = scope.tinkActions.length - 1; i >= 0; i--) {
                  if(scope.tinkActions[i] && scope.tinkActions[i].alwaysEnabled !== true && scope.tinkActions[i].master === master){
                    data.push(scope.tinkActions[i]);
                  }
                }
              return data;
            }

            scope.masterObject = function(){
              return getDataWithNoAlwaysEnabledButtons(true);
            };

            scope.subObject = function(){
              return getDataWithNoAlwaysEnabledButtons(false);
            };

            scope.actionCallBack = function(c){
              if(scope.checked().length !== 0 || c.alwaysEnabled === true){
                var array = $.grep(scope.tinkData, function( a ) {
                  return a.checked;
                });
                if(c.callback instanceof Function){
                  c.callback(array);
                }
              }
              scope.close();
            };

            scope.close = function(){
              $rootScope.$broadcast('popover-open', { group: 'option-table-2',el:$('<div><div>') });
            };

            scope.checkAll = function(){
              var array = [];
              if(scope.tinkData){
                array = $.grep(scope.tinkData, function( a ) {
                  return a.checked;
                });
              }

              if(array.length === scope.tinkData.length){
                for (var i = 0, len = scope.tinkData.length; i < len; i++) {
                  scope.tinkData[i].checked = false;
                }
                scope.allChecked = false;
              }else{
                for (var j = 0, len1 = scope.tinkData.length; j < len1; j++) {
                  scope.tinkData[j].checked = true;
                }
                scope.allChecked = true;
              }

            };
            scope.checked = function(){
              if(scope.tinkData && scope.tinkData.length > 0) {
                return $.grep(scope.tinkData, function( a ) {
                  return a.checked;
                });
              }
              return [];
            };
            scope.checkChange = function(data){
              var array = $.grep(scope.tinkData, function( a ) {
                return a.checked;
              });
              if(scope.tinkChecked){
                scope.tinkChecked({$data:data,$checked:data.checked});
              }
              if(array.length === scope.tinkData.length){
                scope.allChecked = true;
              }else if(array.length === 0 ){
                scope.allChecked = false;
              }else{
                scope.allChecked = false;
              }
            };


            scope.elemDisabled = function(action){
              if(action){
                if(action.alwaysDisabled){
                  return true;
                }
                if(action.checkedAll){
                 if(scope.tinkData.length === scope.checked().length){
                    return false;
                  }else{
                    return true;
                  }
                }
                return (scope.checked().length === 0 || (action.single && scope.checked().length > 1)) && action.alwaysEnabled !== true;
              }
            };

            scope.switchPosition = function(a,b){
              scope.tinkHeaders.swap(a,b);
              controller.changeColumn(a,b);
            };

            scope.NotAllActionsAreVisibleAllTheTime = function(){
              return scope.tinkActions && $filter('filter')(scope.tinkActions, {alwaysEnabled: true}).length !== scope.tinkActions.length;
            };

            scope.hasActions = function(){
              if(scope.tinkActions !== undefined || scope.tinkActions !== null){
                if(scope.tinkActions instanceof Array && scope.tinkActions.length > 0){
                  return true;
                }
              }

              return false;
            };

            //function will be called when pressing arrow for order change
            scope.arrowUp = function(){
              if(scope.selected.value > 0){
                scope.switchPosition(scope.selected.value,scope.selected.value-1);
                scope.selected.value-=1;
              }
            };
            //function will be called when pressing arrow for order change
            scope.arrowDown = function(){
              if(scope.selected.value < scope.tinkHeaders.length-1){
                scope.switchPosition(scope.selected.value,scope.selected.value+1);
                scope.selected.value+=1;
              }
            };

            //added this to swap elements easly
            Array.prototype.swap = function(a, b) {
              var temp = this[a];
              this[a] = this[b];
              this[b] = temp;
            };

          }
        };
      }
    };
  }])
.filter('tinkActionFilter',['$filter',function($filter) {

  // In the return function, we must pass in a single parameter which will be the data we will work on.
  // We have the ability to support multiple other parameters that can be passed into the filter optionally
  return function(input, optional1, optional2) {
    

    var data = [];
    for (var i = input.length - 1; i >= 0; i--) {
      if(input[i] && input[i].alwaysEnabled !== true){
        data.push(input[i]);
      }
    }

    var master = $filter('filter')(data, {master: true});
    if(!master){
      return [];
    }

    if(optional2 === 'master'){
      if(master.length < 5){
        return data;
      }else{
        return data.slice(0,5);
      }
    }else{
      if(master.length >=5){
        return [];
      }else{
        return data.slice(0,5-data.length);
      }
    }
    return [];

  };

}])
.filter('tinkFilterFalse',['$filter',function($filter) {

  // In the return function, we must pass in a single parameter which will be the data we will work on.
  // We have the ability to support multiple other parameters that can be passed into the filter optionally
  return function(input, optional1, optional2) {
    

    var newInput = $filter('filter')(input,optional1),
    data = [];
    if(newInput && newInput.length > 0){
      for (var i = newInput.length - 1; i >= 0; i--) {
        if(newInput[i] && newInput[i][optional2] !== true){
          data.push(newInput[i]);
        }
      }
    }
    

    if(data.length <=0){
      return [];
    }

    return data;

  };

}])
.filter('tinkSlice', function() {
  return function(arr, start) {
    return (arr || []).slice(start);
  };
})
.directive('tinkShiftSort',['$timeout',function(timeout){
  return {
    restrict:'A',
    controller:'interactiveCtrl',
    link:function(scope,elem){
      timeout(function(){
        Sortable.create(elem.find('ul').get(0),{
          ghostClass: 'draggable-placeholder',
          animation: 200,
          handle:'.draggable-elem',
          onStart: function () {
             scope.$apply(function(){
             // scope.selected.value = evt.oldIndex;
            });
          },
          onUpdate: function (evt) {
            scope.$apply(function(){
              var oldIndex = evt.oldIndex;
              var newIndex = evt.newIndex;
              scope.selected.value = evt.newIndex;
              scope.switchPosition(oldIndex,newIndex);

            });
          },
        });
      },200);
    }
  };
}]);
})();
;'use strict';
(function(module) {
  try {
    module = angular.module('tink.interactivetable');
  } catch (e) {
    module = angular.module('tink.interactivetable', ['tink.popover','tink.sorttable','tink.tooltip','tink.safeApply']);
  }
  module.directive('tinkPagination',['lodash',function(_){
  return{
    restrict:'EA',
    templateUrl:'templates/pagination.html',
    scope:{
      tinkTotalItems:'=',
      tinkItemsPerPage:'=',
      tinkItemsPerPageValues:'=',
      tinkCurrentPage:'=',
      tinkChange:'&',
      tinkPaginationId:'@'
    },
    controllerAs:'ctrl',
    controller:['$scope','$rootScope','$timeout',function($scope,$rootScope,timeout){
      var ctrl = this;

      //ctrl.init = function(){
        /*ctrl.tinkTotalItems = $scope.tinkTotalItems;
        $scope.tinkItemsPerPage = $scope.tinkItemsPerPage;
        $scope.tinkItemsPerPageValues = $scope.tinkItemsPerPageValues;
        $scope.tinkCurrentPage =  $scope.tinkCurrentPage;
      //}*/
      ctrl.itemsPerPage = function(){
        if($scope.tinkItemsPerPageValues && $scope.tinkItemsPerPageValues instanceof Array && $scope.tinkItemsPerPageValues.length >0){
          if($scope.tinkItemsPerPageValues.indexOf(parseInt($scope.tinkItemsPerPage)) === -1){
            $scope.tinkItemsPerPage = $scope.tinkItemsPerPageValues[0];
          }
          return $scope.tinkItemsPerPageValues;
        }else{
          var basic = [5,10,20,30];
          if(basic.indexOf(parseInt($scope.tinkItemsPerPage)) === -1){
            $scope.tinkItemsPerPage = basic[0];
          }
          return basic;
        }
      };


      ctrl.perPageChange = function(){
        $rootScope.$broadcast('tink-pagination-'+$scope.tinkPaginationId,'loading');
        timeout(function(){
          $scope.tinkChange({page:$scope.tinkCurrentPage,perPage:$scope.tinkItemsPerPage,next:function(){
            $rootScope.$broadcast('tink-pagination-'+$scope.tinkPaginationId,'ready');
          }});
        },0);
      };

      ctrl.setPage = function(page){
        $scope.tinkCurrentPage = page;
        sendMessage();
      };


      ctrl.setPrev = function(){
        if($scope.tinkCurrentPage > 1){
          $scope.tinkCurrentPage = $scope.tinkCurrentPage -1;
        }
        sendMessage();
      };

      ctrl.setNext = function(){
        if($scope.tinkCurrentPage < ctrl.pages){
          $scope.tinkCurrentPage = $scope.tinkCurrentPage +1;
        }
        sendMessage();
      };

      function sendMessage(){
        $rootScope.$broadcast('tink-pagination-'+$scope.tinkPaginationId,'loading');
        timeout(function(){
          $scope.tinkChange({page:$scope.tinkCurrentPage,perPage:$scope.tinkItemsPerPage,next:function(){
            $rootScope.$broadcast('tink-pagination-'+$scope.tinkPaginationId,'ready');
          }});
        },0);
      }

      ctrl.calculatePages = function(){
        var num = $scope.tinkCurrentPage;
        ctrl.pages = Math.ceil($scope.tinkTotalItems/$scope.tinkItemsPerPage);
        if(ctrl.pages <=0 || ctrl.pages === undefined || ctrl.pages === null || isNaN(ctrl.pages)){
          ctrl.pages = 1;
        }

        if(num > ctrl.pages){
          num = $scope.tinkCurrentPage = ctrl.pages;
        }else if(num <=0 || num === undefined || num === null){
          $scope.tinkCurrentPage = 1;
        }

        var arrayNums;
        if(ctrl.pages <6){
          arrayNums = _.range(2,ctrl.pages);
        }else{
          if(num < 4){
            arrayNums = _.range(2,4);
            arrayNums.push(-1);
          }else if(num >= ctrl.pages -2){
            arrayNums = [-1].concat(_.range(ctrl.pages-2,ctrl.pages));
          }else{
            arrayNums = [-1,num,-1];
          }
        }
        if(ctrl.pages >1 ){
          arrayNums.push(ctrl.pages);
        }
        return arrayNums;
      };

    }]
  };
  }]).filter('limitNum', [function() {
   return function(input, limit) {
      if (input > limit) {
          return limit;
      }
      return input;
   };
  }])
  .filter('tinkMin', [function() {
   return function(input, limit) {
    if(limit === undefined){
      limit = 0;
    }
      if (input < limit) {
          return limit;
      }
      return input;
   };
  }])
  .filter('tinkNumber', [function() {
   return function(input, limit) {
    if(limit === undefined){
      limit = 0;
    }
      if (input < limit) {
          return limit;
      }
      return input;
   };
  }]).directive('tinkPaginationKey',['$rootScope',function(rootScope){
    return {
      link:function($scope,element,attrs){

        rootScope.$on('tink-pagination-'+attrs.tinkPaginationKey,function(e,value){

          var table;
          if(element[0].tagName === 'TABLE'){
            table = $(element[0]);
          }else {
            table = $(element).find('table');
          }
          if(value === 'loading'){
            table.addClass('is-loading');
          }else if(value === 'ready'){
            table.removeClass('is-loading');
          }

        });

      }
    };

  }]);
})();
;angular.module('tink.interactivetable').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/actions.html',
    "<div class=popover-menu-list>  <ul ng-if=!actionConf.menu> <li data-ng-repeat=\"action in tinkActions | tinkSlice:5 | orderBy:'+order'\" data-ng-disabled=elemDisabled(action) data-ng-click=actionCallBack(action)> <i class=\"fa {{action.icon}} fa-fw\"></i>\n" +
    "<span>{{action.name}}</span> </li> </ul>  <ul ng-if=actionConf.menu> <li data-ng-repeat=\"action in tinkActions | filter: { master: true } | tinkActionFilter: tinkActions : 'master' | orderBy:'+order'\" data-ng-disabled=elemDisabled(action) data-ng-click=actionCallBack(action)> <i class=\"fa {{action.icon}} fa-fw\"></i>\n" +
    "<span>{{action.name}}</span> </li> <hr ng-if=\"masterObject() > 0 && subObject() > 0\"> <li data-ng-repeat=\"action in tinkActions | filter: { master: false } | tinkActionFilter: tinkActions | orderBy:'+order'\" data-ng-disabled=elemDisabled(action) data-ng-click=actionCallBack(action)> <i class=\"fa {{action.icon}} fa-fw\"></i>\n" +
    "<span>{{action.name}}</span> </li> </ul> </div>"
  );


  $templateCache.put('templates/columns.html',
    "<div class=table-interactive-options tink-shift-sort>  <div class=table-interactive-sort> <button class=btn-borderless data-ng-disabled=\"selected.value<1\" data-ng-click=arrowUp()><i class=\"fa fa-arrow-up\"> </i></button>\n" +
    "<button class=btn-borderless data-ng-disabled=\"selected.value<0 || selected.value === tinkHeaders.length-1\" data-ng-click=arrowDown()><i class=\"fa fa-arrow-down\"></i></button> </div>  <ul data-ng-model=tinkHeaders class=table-interactive-cols>  <li data-ng-repeat=\"header in tinkHeaders\"> <div class=\"checkbox is-selectable is-draggable\" data-ng-class=\"{selected:selected.value===$index}\"> <input data-ng-disabled=\"header.disabled === true\" type=checkbox data-ng-model=header.checked id=t-{{$index}}{{header.alias}} name=t-{{$index}}{{header.alias}} value={{header.alias}} checked> <label for=t-{{$index}}{{header.alias}}><span class=draggable-elem data-ng-class=\"{selected:selected.value===$index}\" data-ng-click=select($event,$index)> <span data-ng-if=\"header.alias && !header.sortalias\">{{header.alias}}</span>\n" +
    "<span data-ng-if=\"header.alias && header.sortalias\"><em>{{header.sortalias}}</em></span>\n" +
    "<span data-ng-if=\"!header.alias && !header.sortalias\">—</span>\n" +
    "<span data-ng-if=\"!header.alias && header.sortalias\"><em>{{header.sortalias}}</em></span> </span></label> </div> </li> </ul> <div class=table-interactive-sort>  <button class=btn-xs data-ng-click=close()>Sluiten</button> </div> </div>"
  );


  $templateCache.put('templates/interactive-table.html',
    "<div> <div class=\"bar table-interactive-bar\"> <ul data-ng-if=!actionConf.menu class=\"bar-left table-interactive-actions\"> <li data-ng-if=hasActions() data-ng-repeat=\"action in tinkActions | filter: { master: true } | tinkActionFilter: tinkActions : 'master' | orderBy:'+order'\"> <button class=btn-sm data-ng-disabled=elemDisabled(action) data-ng-click=actionCallBack(action)> <i class=\"fa {{action.icon}} fa-fw\"></i>\n" +
    "<span>{{action.name}}</span> </button> </li> <li class=hr data-ng-if=\"hasActions() && masterObject() > 0 && subObject() > 0\"></li> <li data-ng-repeat=\"action in tinkActions | filter: { master: false } | tinkActionFilter: tinkActions | orderBy:'+order'\"> <button class=btn-sm data-ng-disabled=elemDisabled(action) data-ng-click=actionCallBack(action)> <i class=\"fa {{action.icon}} fa-fw\"></i>\n" +
    "<span>{{action.name}}</span> </button> </li> <li data-ng-if=\"(masterObject.length + subObject.length) > 5\" tink-popover tink-popover-group=option-table tink-popover-template=templates/actions.html> <span> <button class=btn-sm data-ng-disabled=elemDisabled(action)> <i class=\"fa fa-ellipsis-h fa-fw\"></i>\n" +
    "<span>Meer acties</span> </button> </span> </li> </ul> <ul data-ng-if=actionConf.menu class=\"bar-left table-interactive-popover-actions\"> <li ng-if=hasActions()> <button class=btn-sm tink-popover tink-popover-group=option-table-1 tink-popover-template=templates/actions.html>Acties <i class=\"fa fa-caret-down\"></i></button> </li> </ul> <ul class=bar-right> <li data-ng-repeat=\"action in tinkActions | tinkFilterFalse: {alwaysEnabled:true} : 'notSmall'  | orderBy:'+order'\"> <button class=btn-sm data-ng-click=actionCallBack(action) tink-tooltip={{action.name}} tink-tooltip-align=top> <i class=\"fa {{action.icon}} fa-fw\"></i>  </button> </li> <li data-ng-repeat=\"action in tinkActions | tinkFilterFalse: { alwaysEnabled: true,notSmall:true}  | orderBy:'+order'\"> <button class=btn-sm data-ng-click=actionCallBack(action)> <i class=\"fa {{action.icon}} fa-fw\"></i>\n" +
    "<span>{{action.name}}</span> </button> </li> <li data-ng-if=\"tinkAllowColumnReorder !== false\"> <button class=btn-sm tink-popover tink-popover-group=option-table tink-popover-template=templates/columns.html>Kolommen <i class=\"fa fa-caret-down\"></i></button> </li> </ul> </div> <div data-ng-transclude></div> </div>"
  );


  $templateCache.put('templates/pagination.html',
    "<div class=table-sort-options> <div class=table-sort-info> <strong>{{tinkTotalItems > 0 ? (tinkItemsPerPage*(tinkCurrentPage-1)+1 | number:0) : '0'}} - {{tinkItemsPerPage*tinkCurrentPage | limitNum:tinkTotalItems | tinkMin:0 | number:0}}</strong> van {{tinkTotalItems | tinkMin:0 | number:0}} <div class=select> <select data-ng-change=ctrl.perPageChange() data-ng-model=tinkItemsPerPage ng-options=\"o as o for o in ctrl.itemsPerPage()\">> </select> </div> items per pagina </div> <div class=table-sort-pagination> <div class=\"btn-group btn-group-sm\"> <a href=\"\" class=\"btn prev\" data-ng-class=\"{disabled:tinkCurrentPage===1}\" data-ng-click=\"tinkCurrentPage===1 || ctrl.setPrev()\" ng-disabled=\"tinkCurrentPage===1\"><span>Vorige</span></a>\n" +
    "<a href=\"\" class=btn data-ng-class=\"{active:tinkCurrentPage===1}\" data-ng-click=ctrl.setPage(1)><span>1</span></a>\n" +
    "<a href=\"\" class=btn data-ng-repeat=\"pag in ctrl.calculatePages() track by $index\" data-ng-class=\"{active:pag===tinkCurrentPage}\" data-ng-click=\"pag === -1 || ctrl.setPage(pag)\"><span data-ng-if=\"pag !== -1\">{{pag | number:0}}</span> <span data-ng-show=\"pag === -1\">…<span></span></span></a>\n" +
    "<a href=\"\" class=\"btn next\" data-ng-click=\"tinkCurrentPage===ctrl.pages || ctrl.setNext()\" data-ng-class=\"{disabled:tinkCurrentPage===ctrl.pages}\" ng-disabled=\"tinkCurrentPage===ctrl.pages\"><span>Volgende</span></a> </div> </div> </div>"
  );

}]);
