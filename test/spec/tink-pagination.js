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

    it('1-10',function(){
      var element = compileDirective('default',{nums:1,totalitems:20,numpp:10});
      var val = element.find('.table-sort-info strong').html();
      expect(val).toBe('1 - 10');
    });

    it('11-20',function(){
      var element = compileDirective('default',{nums:2,totalitems:20,numpp:10});
      var val = element.find('.table-sort-info strong').html();
      expect(val).toBe('11 - 20');
    });

    it('11-19',function(){
      var element = compileDirective('default',{nums:2,totalitems:19,numpp:10});
      var val = element.find('.table-sort-info strong').html();
      expect(val).toBe('11 - 19');
    });

    it('zero',function(){
      var element = compileDirective('default',{nums:1,totalitems:undefined,numpp:10});
      var val = element.find('.table-sort-info .table-total-rows-info').html();
      expect(val).toBe('0');
    });

    it('100',function(){
      var element = compileDirective('default',{nums:1,totalitems:100,numpp:10});
      var val = element.find('.table-sort-info .table-total-rows-info').html();
      expect(val).toBe('100');
    });

    it('active page 1',function(){
      var element = compileDirective('default',{nums:1,totalitems:100,numpp:10});
      var activePage = element.find('.btn.active span').html()
      expect(activePage).toBe('1');
    });

    it('active page 5',function(){
      var element = compileDirective('default',{nums:5,totalitems:100,numpp:10});
      var activePage = element.find('.btn.active span').html()
      expect(activePage).toBe('5');
    });

    it('active page 5 with not that many elements',function(){
      var element = compileDirective('default',{nums:5,totalitems:10,numpp:10});
      var activePage = element.find('.btn.active span').html()
      expect(activePage).toBe('1');
    });

    it('active page undefined',function(){
      var element = compileDirective('default',{nums:undefined,totalitems:10,numpp:10});
      var activePage = element.find('.btn.active span').html()
      expect(activePage).toBe('1');
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