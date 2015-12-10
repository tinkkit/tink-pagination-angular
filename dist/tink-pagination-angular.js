'use strict';
(function(module) {
  try {
    module = angular.module('tink.pagination');
  } catch (e) {
    module = angular.module('tink.pagination', ['ngLodash','tink.safeApply']);
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
;angular.module('tink.pagination').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/pagination.html',
    "<div class=table-sort-options> <div class=table-sort-info> <strong>{{tinkTotalItems > 0 ? (tinkItemsPerPage*(tinkCurrentPage-1)+1 | number:0) : '0'}} - {{tinkItemsPerPage*tinkCurrentPage | limitNum:tinkTotalItems | tinkMin:0 | number:0}}</strong> van {{tinkTotalItems | tinkMin:0 | number:0}} <div class=select> <select data-ng-change=ctrl.perPageChange() data-ng-model=tinkItemsPerPage ng-options=\"o as o for o in ctrl.itemsPerPage()\">> </select> </div> items per pagina </div> <div class=table-sort-pagination> <div class=\"btn-group btn-group-sm\"> <a href=\"\" class=\"btn prev\" data-ng-class=\"{disabled:tinkCurrentPage===1}\" data-ng-click=\"tinkCurrentPage===1 || ctrl.setPrev()\" ng-disabled=\"tinkCurrentPage===1\"><span>Vorige</span></a>\n" +
    "<a href=\"\" class=btn data-ng-class=\"{active:tinkCurrentPage===1}\" data-ng-click=ctrl.setPage(1)><span>1</span></a>\n" +
    "<a href=\"\" class=btn data-ng-repeat=\"pag in ctrl.calculatePages() track by $index\" data-ng-class=\"{active:pag===tinkCurrentPage}\" data-ng-click=\"pag === -1 || ctrl.setPage(pag)\"><span data-ng-if=\"pag !== -1\">{{pag | number:0}}</span> <span data-ng-show=\"pag === -1\">…<span></span></span></a>\n" +
    "<a href=\"\" class=\"btn next\" data-ng-click=\"tinkCurrentPage===ctrl.pages || ctrl.setNext()\" data-ng-class=\"{disabled:tinkCurrentPage===ctrl.pages}\" ng-disabled=\"tinkCurrentPage===ctrl.pages\"><span>Volgende</span></a> </div> </div> </div>"
  );

}]);
