'use strict';
describe('tink-pagination-angular', function() {

  beforeEach(module('tink.pagination'));

  var bodyEl = $('body'), sandboxEl;
  var $compile, $templateCache, scope;

  // beforeEach(module('tink'));

  beforeEach(inject(function (_$rootScope_, _$compile_, _$templateCache_) {
    scope = _$rootScope_.$new();
    $compile = _$compile_;
    $templateCache = _$templateCache_;
    bodyEl.html('');
    sandboxEl = $('<div>').attr('id', 'sandbox').appendTo(bodyEl);

    var template = $templateCache.get('src/templates/pagination.html');
    $templateCache.put('templates/pagination.html',template);
  }));

  afterEach(function() {
    scope.$destroy();
    sandboxEl.remove();
  });

  function compileDirective(template, locals) {
    template = templates[template];
    angular.extend(scope, angular.copy(template.scope || templates['default'].scope), locals);
    var element = $(template.element).appendTo(sandboxEl);
    element = $compile(element)(scope);
    scope.$digest();
    return jQuery(element[0]);
  }

  var templates = {
    'default': {
      scope: {nums:1,numpp:5,totalitems:100},
      element: '<tink-pagination  tink-current-page="nums" tink-change="changed(page,perPage,next)" tink-total-items="totalitems" tink-items-per-page="numpp"></tink-pagination>'
    }
  };


  describe('default', function() {
    it('should run this basic setup',function(){
      var element = compileDirective('default');
      console.log(element);
    });
  });


});