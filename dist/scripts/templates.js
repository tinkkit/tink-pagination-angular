angular.module('tink.pagination').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/pagination.html',
    "<div class=table-sort-options> <div class=table-sort-info> <strong>{{tinkTotalItems > 0 ? (tinkItemsPerPage*(tinkCurrentPage-1)+1 | number:0) : '0'}} - {{tinkItemsPerPage*tinkCurrentPage | limitNum:tinkTotalItems | tinkMin:0 | number:0}}</strong> van {{tinkTotalItems | tinkMin:0 | number:0}} <div class=select> <select data-ng-change=ctrl.perPageChange() data-ng-model=tinkItemsPerPage ng-options=\"o as o for o in ctrl.itemsPerPage()\">> </select> </div> items per pagina </div> <div class=table-sort-pagination> <div class=\"btn-group btn-group-sm\"> <a href=\"\" class=\"btn prev\" data-ng-class=\"{disabled:tinkCurrentPage===1}\" data-ng-click=\"tinkCurrentPage===1 || ctrl.setPrev()\" ng-disabled=\"tinkCurrentPage===1\"><span>Vorige</span></a>\n" +
    "<a href=\"\" class=btn data-ng-class=\"{active:tinkCurrentPage===1}\" data-ng-click=ctrl.setPage(1)><span>1</span></a>\n" +
    "<a href=\"\" class=btn data-ng-repeat=\"pag in ctrl.calculatePages() track by $index\" data-ng-class=\"{active:pag===tinkCurrentPage}\" data-ng-click=\"pag === -1 || ctrl.setPage(pag)\"><span data-ng-if=\"pag !== -1\">{{pag | number:0}}</span> <span data-ng-show=\"pag === -1\">…<span></span></span></a>\n" +
    "<a href=\"\" class=\"btn next\" data-ng-click=\"tinkCurrentPage===ctrl.pages || ctrl.setNext()\" data-ng-class=\"{disabled:tinkCurrentPage===ctrl.pages}\" ng-disabled=\"tinkCurrentPage===ctrl.pages\"><span>Volgende</span></a> </div> </div> </div>"
  );

}]);
