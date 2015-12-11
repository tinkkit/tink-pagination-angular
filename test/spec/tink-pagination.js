'use strict';
describe('tink-pagination-angular', function() {

  beforeEach(module('ngAnimate'));
  beforeEach(module('ngAnimateMock'));
  beforeEach(module('ngSanitize'));
  beforeEach(module('tink.pagination'));
  beforeEach(module('templates'));

  var bodyEl = $('body'), sandboxEl;
  var $compile, $templateCache, scope;

  // beforeEach(module('tink'));

  beforeEach(inject(function (_$rootScope_, _$compile_, _$templateCache_) {
    scope = _$rootScope_.$new();
    $compile = _$compile_;
    $templateCache = _$templateCache_;
    

    var template = $templateCache.get('src/templates/pagination.html');
    $templateCache.put('templates/pagination.html',template);

    bodyEl.html('');
    sandboxEl = $('<div>').attr('id', 'sandbox').appendTo(bodyEl);
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
      scope: {nums:1,numpp:5,totalitems:100,tinkItemsPerPageValues:undefined},
      element: '<tink-pagination tink-items-per-page-values="tinkItemsPerPageValues" tink-current-page="nums" tink-change="changed(page,perPage,next)" tink-total-items="totalitems" tink-items-per-page="numpp"></tink-pagination>'
    }
  };

  describe('Current page', function() {

    it('default',function(){

    });

  });

  describe('perPage', function() {
    it('default',function(){
      var element = compileDirective('default');
      var options = element.find('div.select option');
      var array = []
      for(var i=0;i<options.length;i++){
        array.push(parseInt($(options.get(i)).html()))
      }
      expect(array).toEqual([5,10,20,30]);
    });

    it('change the values',function(){
      var element = compileDirective('default',{nums:1,numpp:5,totalitems:100,tinkItemsPerPageValues:[5,15,30,50]});
      var options = element.find('div.select option');
      var array = []
      for(var i=0;i<options.length;i++){
        array.push(parseInt($(options.get(i)).html()))
      }
      expect(array).toEqual([5,15,30,50]);
    });
  });



});