describe('timepicker directive', function () {
  var $rootScope, $compile, element;

  beforeEach(module('ui.bootstrap.timepicker'));
  beforeEach(module('template/timepicker/timepicker.html'));
  beforeEach(inject(function(_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $rootScope.time = newTime(14, 40, 25);

    element = $compile('<timepicker ng-model="time"></timepicker>')($rootScope);
    $rootScope.$digest();
  }));

  function newTime(hours, minutes, seconds) {
    var time = new Date();
    time.setHours(hours);
    time.setMinutes(minutes);
    time.setSeconds(seconds);
    return time;
  }

  function getTimeState(withoutMeridian, withoutSeconds) {
    var inputs = element.find('input');
    var limit = withoutSeconds ? 2 : 3;
    
    var state = [];
    for (var i = 0; i < limit; i ++) {
      state.push(inputs.eq(i).val());
    }
    if ( withoutMeridian !== true ) {
      state.push( getMeridianButton().text() );
    }
    return state;
  }

  function getModelState(withoutSeconds) {

    if( withoutSeconds ) {
      return [ $rootScope.time.getHours(), $rootScope.time.getMinutes() ];
    }

    return [ $rootScope.time.getHours(), $rootScope.time.getMinutes(),$rootScope.time.getSeconds() ];
  }

  function getArrow(isUp, tdIndex) {
    return element.find('tr').eq( (isUp) ? 0 : 2 ).find('td').eq( tdIndex ).find('a').eq(0);
  }

  function getHoursButton(isUp) {
    return getArrow(isUp, 0);
  }

  function getMinutesButton(isUp) {
    return getArrow(isUp, 2);
  }

  function getSecondsButton(isUp) {
    return getArrow(isUp, 4);
  }

  function getMeridianButton() {
    return element.find('button').eq(0);
  }

  function doClick(button, n) {
    for (var i = 0, max = n || 1; i < max; i++) {
      button.click();
      $rootScope.$digest();
    }
  }

  function wheelThatMouse(delta) {
    var e = $.Event('mousewheel');
    e.wheelDelta = delta;
    return e;
  }

  function wheelThatOtherMouse(delta) {
    var e = $.Event('wheel');
    e.deltaY = delta;
    return e;
  }

  it('contains three row & four input elements', function() {
    expect(element.find('tr').length).toBe(3);
    expect(element.find('input').length).toBe(3);
    expect(element.find('button').length).toBe(1);
  });

  it('has initially the correct time & meridian', function() {
    expect(getTimeState()).toEqual(['02', '40', '25', 'PM']);
    expect(getModelState()).toEqual([14, 40, 25]);
  });

  it('has `selected` current time when model is initially cleared', function() {
    $rootScope.time = null;
    element = $compile('<timepicker ng-model="time"></timepicker>')($rootScope);
    $rootScope.$digest();

    expect($rootScope.time).toBe(null);
    expect(getTimeState()).not.toEqual(['', '', '' , '']);
  });

  it('changes inputs when model changes value', function() {
    $rootScope.time = newTime(11, 50, 20);
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['11', '50', '20', 'AM']);
    expect(getModelState()).toEqual([11, 50, 20]);

    $rootScope.time = newTime(16, 40, 45);
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['04', '40', '45', 'PM']);
    expect(getModelState()).toEqual([16, 40, 45]);
  });

  it('increases / decreases hours when arrows are clicked', function() {
    var up = getHoursButton(true);
    var down = getHoursButton(false);

    doClick(up);
    expect(getTimeState()).toEqual(['03', '40', '25', 'PM']);
    expect(getModelState()).toEqual([15, 40, 25]);

    doClick(down);
    expect(getTimeState()).toEqual(['02', '40', '25', 'PM']);
    expect(getModelState()).toEqual([14, 40, 25]);

    doClick(down);
    expect(getTimeState()).toEqual(['01', '40', '25', 'PM']);
    expect(getModelState()).toEqual([13, 40, 25]);
  });

  it('increase / decreases minutes by default step when arrows are clicked', function() {
    var up = getMinutesButton(true);
    var down = getMinutesButton(false);

    doClick(up);
    expect(getTimeState()).toEqual(['02', '41', '25', 'PM']);
    expect(getModelState()).toEqual([14, 41, 25]);

    doClick(down);
    expect(getTimeState()).toEqual(['02', '40', '25', 'PM']);
    expect(getModelState()).toEqual([14, 40, 25]);

    doClick(down);
    expect(getTimeState()).toEqual(['02', '39', '25', 'PM']);
    expect(getModelState()).toEqual([14, 39, 25]);
  });

  it('increase / decreases seconds by default step when arrows are clicked', function() {
    var up = getSecondsButton(true);
    var down = getSecondsButton(false);

    doClick(up);
    expect(getTimeState()).toEqual(['02', '40', '26', 'PM']);
    expect(getModelState()).toEqual([14, 40, 26]);

    doClick(down);
    expect(getTimeState()).toEqual(['02', '40', '25', 'PM']);
    expect(getModelState()).toEqual([14, 40, 25]);

    doClick(down);
    expect(getTimeState()).toEqual(['02', '40', '24', 'PM']);
    expect(getModelState()).toEqual([14, 40, 24]);
  });

  it('meridian button has correct type', function() {
    var button = getMeridianButton();
    expect(button.attr('type')).toBe('button');
  });

  it('toggles meridian when button is clicked', function() {
    var button = getMeridianButton();

    doClick(button);
    expect(getTimeState()).toEqual(['02', '40', '25', 'AM']);
    expect(getModelState()).toEqual([2, 40, 25]);

    doClick(button);
    expect(getTimeState()).toEqual(['02', '40', '25', 'PM']);
    expect(getModelState()).toEqual([14, 40, 25]);

    doClick(button);
    expect(getTimeState()).toEqual(['02', '40', '25', 'AM']);
    expect(getModelState()).toEqual([2, 40, 25]);
  });

  it('has minutes "connected" to hours', function() {
    var up = getMinutesButton(true);
    var down = getMinutesButton(false);

    doClick(up, 10);
    expect(getTimeState()).toEqual(['02', '50', '25', 'PM']);
    expect(getModelState()).toEqual([14, 50, 25]);

    doClick(up, 10);
    expect(getTimeState()).toEqual(['03', '00', '25', 'PM']);
    expect(getModelState()).toEqual([15, 0, 25]);

    doClick(up, 10);
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['03', '10', '25', 'PM']);
    expect(getModelState()).toEqual([15, 10, 25]);

    doClick(down, 10);
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['03', '00', '25', 'PM']);
    expect(getModelState()).toEqual([15, 0, 25]);

    doClick(down, 10);
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['02', '50', '25', 'PM']);
    expect(getModelState()).toEqual([14, 50, 25]);
  });

  it('has seconds "connected" to minutes', function() {
    var up = getSecondsButton(true);
    var down = getSecondsButton(false);

    doClick(up, 15);
    expect(getTimeState()).toEqual(['02', '40', '40', 'PM']);
    expect(getModelState()).toEqual([14, 40, 40]);

    doClick(up, 15);
    expect(getTimeState()).toEqual(['02', '40', '55', 'PM']);
    expect(getModelState()).toEqual([14, 40, 55]);

    doClick(up, 15);
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['02', '41', '10', 'PM']);
    expect(getModelState()).toEqual([14, 41, 10]);

    doClick(down, 15);
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['02', '40', '55', 'PM']);
    expect(getModelState()).toEqual([14, 40, 55]);

    doClick(down, 15);
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['02', '40', '40', 'PM']);
    expect(getModelState()).toEqual([14, 40, 40]);
  });

  it('has hours "connected" to meridian', function() {
    var up = getHoursButton(true);
    var down = getHoursButton(false);

    // AM -> PM
    $rootScope.time = newTime(11, 0, 25);
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['11', '00', '25', 'AM']);
    expect(getModelState()).toEqual([11, 0, 25]);

    doClick(up);
    expect(getTimeState()).toEqual(['12', '00', '25', 'PM']);
    expect(getModelState()).toEqual([12, 0, 25]);

    doClick(up);
    expect(getTimeState()).toEqual(['01', '00', '25', 'PM']);
    expect(getModelState()).toEqual([13, 0, 25]);

    doClick(down);
    expect(getTimeState()).toEqual(['12', '00', '25', 'PM']);
    expect(getModelState()).toEqual([12, 0, 25]);

    doClick(down);
    expect(getTimeState()).toEqual(['11', '00', '25', 'AM']);
    expect(getModelState()).toEqual([11, 0, 25]);

    // PM -> AM
    $rootScope.time = newTime(23, 0, 25);
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['11', '00', '25', 'PM']);
    expect(getModelState()).toEqual([23, 0, 25]);

    doClick(up);
    expect(getTimeState()).toEqual(['12', '00', '25', 'AM']);
    expect(getModelState()).toEqual([0, 0, 25]);

    doClick(up);
    expect(getTimeState()).toEqual(['01', '00', '25', 'AM']);
    expect(getModelState()).toEqual([01, 0, 25]);

    doClick(down);
    expect(getTimeState()).toEqual(['12', '00', '25', 'AM']);
    expect(getModelState()).toEqual([0, 0, 25]);

    doClick(down);
    expect(getTimeState()).toEqual(['11', '00', '25', 'PM']);
    expect(getModelState()).toEqual([23, 0, 25]);
  });

  it('changes only the time part when hours change', function() {
    $rootScope.time = newTime(23, 50, 20);
    $rootScope.$digest();

    var date =  $rootScope.time.getDate();
    var up = getHoursButton(true);
    doClick(up);

    expect(getTimeState()).toEqual(['12', '50', '20', 'AM']);
    expect(getModelState()).toEqual([0, 50, 20]);
    expect(date).toEqual($rootScope.time.getDate());
  });

  it('changes only the time part when minutes change', function() {
    element = $compile('<timepicker ng-model="time" minute-step="15"></timepicker>')($rootScope);
    $rootScope.time = newTime(0, 0, 0);
    $rootScope.$digest();

    var date =  $rootScope.time.getDate();
    var up = getMinutesButton(true);
    doClick(up, 2);
    expect(getTimeState()).toEqual(['12', '30', '00', 'AM']);
    expect(getModelState()).toEqual([0, 30, 0]);
    expect(date).toEqual($rootScope.time.getDate());

    var down = getMinutesButton(false);
    doClick(down, 2);
    expect(getTimeState()).toEqual(['12', '00', '00', 'AM']);
    expect(getModelState()).toEqual([0, 0, 0]);
    expect(date).toEqual($rootScope.time.getDate());

    doClick(down, 2);
    expect(getTimeState()).toEqual(['11', '30', '00', 'PM']);
    expect(getModelState()).toEqual([23, 30, 0]);
    expect(date).toEqual($rootScope.time.getDate());
  });

  it('responds properly on "mousewheel" events', function() {
    var inputs = element.find('input');
    var hoursEl = inputs.eq(0), minutesEl = inputs.eq(1), secondsEl = inputs.eq(2);
    var upMouseWheelEvent = wheelThatMouse(1);
    var downMouseWheelEvent = wheelThatMouse(-1);

    expect(getTimeState()).toEqual(['02', '40', '25', 'PM']);
    expect(getModelState()).toEqual([14, 40, 25]);

    // UP
    hoursEl.trigger( upMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['03', '40', '25', 'PM']);
    expect(getModelState()).toEqual([15, 40, 25]);

    hoursEl.trigger( upMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['04', '40', '25', 'PM']);
    expect(getModelState()).toEqual([16, 40, 25]);

    minutesEl.trigger( upMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['04', '41', '25', 'PM']);
    expect(getModelState()).toEqual([16, 41, 25]);

    minutesEl.trigger( upMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['04', '42', '25', 'PM']);
    expect(getModelState()).toEqual([16, 42, 25]);

    secondsEl.trigger( upMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['04', '42', '26', 'PM']);
    expect(getModelState()).toEqual([16, 42, 26]);

    secondsEl.trigger( upMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['04', '42', '27', 'PM']);
    expect(getModelState()).toEqual([16, 42, 27]);

    // DOWN
    secondsEl.trigger( downMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['04', '42', '26', 'PM']);
    expect(getModelState()).toEqual([16, 42, 26]);

    secondsEl.trigger( downMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['04', '42', '25', 'PM']);
    expect(getModelState()).toEqual([16, 42, 25]);

    minutesEl.trigger( downMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['04', '41', '25', 'PM']);
    expect(getModelState()).toEqual([16, 41, 25]);

    minutesEl.trigger( downMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['04', '40', '25', 'PM']);
    expect(getModelState()).toEqual([16, 40, 25]);

    hoursEl.trigger( downMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['03', '40', '25', 'PM']);
    expect(getModelState()).toEqual([15, 40, 25]);

    hoursEl.trigger( downMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['02', '40', '25', 'PM']);
    expect(getModelState()).toEqual([14, 40, 25]);


  });

  it('responds properly on "wheel" events', function() {
    var inputs = element.find('input');
    var hoursEl = inputs.eq(0), minutesEl = inputs.eq(1), secondsEl = inputs.eq(2);
    var upMouseWheelEvent = wheelThatOtherMouse(-1);
    var downMouseWheelEvent = wheelThatOtherMouse(1);

    expect(getTimeState()).toEqual(['02', '40', '25', 'PM']);
    expect(getModelState()).toEqual([14, 40, 25]);

    // UP
    hoursEl.trigger( upMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['03', '40', '25', 'PM']);
    expect(getModelState()).toEqual([15, 40, 25]);

    hoursEl.trigger( upMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['04', '40', '25', 'PM']);
    expect(getModelState()).toEqual([16, 40, 25]);

    minutesEl.trigger( upMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['04', '41', '25', 'PM']);
    expect(getModelState()).toEqual([16, 41, 25]);

    minutesEl.trigger( upMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['04', '42', '25', 'PM']);
    expect(getModelState()).toEqual([16, 42, 25]);

    secondsEl.trigger( upMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['04', '42', '26', 'PM']);
    expect(getModelState()).toEqual([16, 42, 26]);

    secondsEl.trigger( upMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['04', '42', '27', 'PM']);
    expect(getModelState()).toEqual([16, 42, 27]);

    // DOWN
    secondsEl.trigger( downMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['04', '42', '26', 'PM']);
    expect(getModelState()).toEqual([16, 42, 26]);

    secondsEl.trigger( downMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['04', '42', '25', 'PM']);
    expect(getModelState()).toEqual([16, 42, 25]);

    minutesEl.trigger( downMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['04', '41', '25', 'PM']);
    expect(getModelState()).toEqual([16, 41, 25]);

    minutesEl.trigger( downMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['04', '40', '25', 'PM']);
    expect(getModelState()).toEqual([16, 40, 25]);

    hoursEl.trigger( downMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['03', '40', '25', 'PM']);
    expect(getModelState()).toEqual([15, 40, 25]);

    hoursEl.trigger( downMouseWheelEvent );
    $rootScope.$digest();
    expect(getTimeState()).toEqual(['02', '40', '25', 'PM']);
    expect(getModelState()).toEqual([14, 40, 25]);
  });

  describe('attributes', function () {
    beforeEach(function() {
      $rootScope.hstep = 2;
      $rootScope.mstep = 30;
      $rootScope.sstep = 30;
      $rootScope.time = newTime(14, 0 , 0);
      element = $compile('<timepicker ng-model="time" hour-step="hstep" minute-step="mstep" second-step="sstep"></timepicker>')($rootScope);
      $rootScope.$digest();
    });

    it('increases / decreases hours by configurable step', function() {
      var up = getHoursButton(true);
      var down = getHoursButton(false);

      expect(getTimeState()).toEqual(['02', '00', '00', 'PM']);
      expect(getModelState()).toEqual([14, 0, 0]);

      doClick(up);
      expect(getTimeState()).toEqual(['04', '00', '00', 'PM']);
      expect(getModelState()).toEqual([16, 0, 0]);

      doClick(down);
      expect(getTimeState()).toEqual(['02', '00', '00', 'PM']);
      expect(getModelState()).toEqual([14, 0, 0]);

      doClick(down);
      expect(getTimeState()).toEqual(['12', '00', '00', 'PM']);
      expect(getModelState()).toEqual([12, 0, 0]);

      // Change step
      $rootScope.hstep = 3;
      $rootScope.$digest();

      doClick(up);
      expect(getTimeState()).toEqual(['03', '00', '00', 'PM']);
      expect(getModelState()).toEqual([15, 0, 0]);

      doClick(down);
      expect(getTimeState()).toEqual(['12', '00', '00', 'PM']);
      expect(getModelState()).toEqual([12, 0, 0]);
    });

    it('increases / decreases minutes by configurable step', function() {
      var up = getMinutesButton(true);
      var down = getMinutesButton(false);

      doClick(up);
      expect(getTimeState()).toEqual(['02', '30', '00', 'PM']);
      expect(getModelState()).toEqual([14, 30, 0]);

      doClick(up);
      expect(getTimeState()).toEqual(['03', '00', '00', 'PM']);
      expect(getModelState()).toEqual([15, 0, 0]);

      doClick(down);
      expect(getTimeState()).toEqual(['02', '30', '00', 'PM']);
      expect(getModelState()).toEqual([14, 30, 0]);

      doClick(down);
      expect(getTimeState()).toEqual(['02', '00', '00', 'PM']);
      expect(getModelState()).toEqual([14, 0, 0]);

      // Change step
      $rootScope.mstep = 15;
      $rootScope.$digest();

      doClick(up);
      expect(getTimeState()).toEqual(['02', '15', '00', 'PM']);
      expect(getModelState()).toEqual([14, 15, 0]);

      doClick(down);
      expect(getTimeState()).toEqual(['02', '00', '00', 'PM']);
      expect(getModelState()).toEqual([14, 0, 0]);

      doClick(down);
      expect(getTimeState()).toEqual(['01', '45', '00', 'PM']);
      expect(getModelState()).toEqual([13, 45, 0]);
    });

    it('responds properly on "mousewheel" events with configurable steps', function() {
      var inputs = element.find('input');
      var hoursEl = inputs.eq(0), minutesEl = inputs.eq(1), secondsEl = inputs.eq(2);
      var upMouseWheelEvent = wheelThatMouse(1);
      var downMouseWheelEvent = wheelThatMouse(-1);

      expect(getTimeState()).toEqual(['02', '00', '00', 'PM']);
      expect(getModelState()).toEqual([14, 0, 0]);

      // UP
      hoursEl.trigger( upMouseWheelEvent );
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['04', '00', '00', 'PM']);
      expect(getModelState()).toEqual([16, 0, 0]);

      minutesEl.trigger( upMouseWheelEvent );
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['04', '30', '00', 'PM']);
      expect(getModelState()).toEqual([16, 30, 0]);

      secondsEl.trigger( upMouseWheelEvent );
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['04', '30', '30', 'PM']);
      expect(getModelState()).toEqual([16, 30, 30]);

      // DOWN

      secondsEl.trigger( downMouseWheelEvent );
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['04', '30', '00', 'PM']);
      expect(getModelState()).toEqual([16, 30, 0]);

      minutesEl.trigger( downMouseWheelEvent );
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['04', '00', '00', 'PM']);
      expect(getModelState()).toEqual([16, 0, 0]);

      hoursEl.trigger( downMouseWheelEvent );
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['02', '00', '00', 'PM']);
      expect(getModelState()).toEqual([14, 0, 0]);
    });

    it('responds properly on "wheel" events with configurable steps', function() {
      var inputs = element.find('input');
      var hoursEl = inputs.eq(0), minutesEl = inputs.eq(1), secondsEl = inputs.eq(2);
      var upMouseWheelEvent = wheelThatOtherMouse(-1);
      var downMouseWheelEvent = wheelThatOtherMouse(1);

      expect(getTimeState()).toEqual(['02', '00', '00', 'PM']);
      expect(getModelState()).toEqual([14, 0, 0]);

      // UP
      hoursEl.trigger( upMouseWheelEvent );
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['04', '00', '00', 'PM']);
      expect(getModelState()).toEqual([16, 0, 0]);

      minutesEl.trigger( upMouseWheelEvent );
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['04', '30', '00', 'PM']);
      expect(getModelState()).toEqual([16, 30, 0]);

      secondsEl.trigger( upMouseWheelEvent );
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['04', '30', '30', 'PM']);
      expect(getModelState()).toEqual([16, 30, 30]);

      // DOWN

      secondsEl.trigger( downMouseWheelEvent );
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['04', '30', '00', 'PM']);
      expect(getModelState()).toEqual([16, 30, 0]);

      minutesEl.trigger( downMouseWheelEvent );
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['04', '00', '00', 'PM']);
      expect(getModelState()).toEqual([16, 0, 0]);

      hoursEl.trigger( downMouseWheelEvent );
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['02', '00', '00', 'PM']);
      expect(getModelState()).toEqual([14, 0, 0]);
    });

    it('can handle strings as steps', function() {
      var upHours = getHoursButton(true);
      var upMinutes = getMinutesButton(true);
      var upSeconds = getSecondsButton(true);

      expect(getTimeState()).toEqual(['02', '00', '00', 'PM']);
      expect(getModelState()).toEqual([14, 0, 0]);

      $rootScope.hstep = '4';
      $rootScope.mstep = '20';
      $rootScope.sstep = '20';
      $rootScope.$digest();

      doClick(upHours);
      expect(getTimeState()).toEqual(['06', '00', '00', 'PM']);
      expect(getModelState()).toEqual([18, 0, 0]);

      doClick(upMinutes);
      expect(getTimeState()).toEqual(['06', '20', '00', 'PM']);
      expect(getModelState()).toEqual([18, 20, 0]);

      doClick(upSeconds);
      expect(getTimeState()).toEqual(['06', '20', '20', 'PM']);
      expect(getModelState()).toEqual([18, 20, 20]);

    });

  });
  
  describe('without seconds mode',function(){
     beforeEach(function(){
        $rootScope.displaysSeconds = false;
        $rootScope.time = newTime(14,40,35);
        element = $compile('<timepicker ng-model="time" show-seconds="displaysSeconds"></timepicker>')($rootScope);
        $rootScope.$digest();
     });

    it('increases / decreases hours when arrows are clicked', function() {

      var up = getHoursButton(true);
      var down = getHoursButton(false);

      doClick(up);
      expect(getTimeState(false, true)).toEqual(['03', '40', 'PM']);
      expect(getModelState(true)).toEqual([15, 40]);

      doClick(down);
      expect(getTimeState(false, true)).toEqual(['02', '40', 'PM']);
      expect(getModelState(true)).toEqual([14, 40]);

      doClick(down);
      expect(getTimeState(false, true)).toEqual(['01', '40', 'PM']);
      expect(getModelState(true)).toEqual([13, 40]);

    });

    it('increase / decreases minutes by default step when arrows are clicked', function() {
     
      var up = getMinutesButton(true);
      var down = getMinutesButton(false);

      doClick(up);
      expect(getTimeState(false, true)).toEqual(['02', '41', 'PM']);
      expect(getModelState(true)).toEqual([14, 41]);

      doClick(down);
      expect(getTimeState(false, true)).toEqual(['02', '40', 'PM']);
      expect(getModelState(true)).toEqual([14, 40]);

      doClick(down);
      expect(getTimeState(false, true)).toEqual(['02', '39', 'PM']);
      expect(getModelState(true)).toEqual([14, 39]);
    });

    it('has minutes "connected" to hours', function() {

      var up = getMinutesButton(true);
      var down = getMinutesButton(false);

      doClick(up, 10);
      expect(getTimeState(false, true)).toEqual(['02', '50', 'PM']);
      expect(getModelState(true)).toEqual([14, 50]);

      doClick(up, 10);
      expect(getTimeState(false, true)).toEqual(['03', '00', 'PM']);
      expect(getModelState(true)).toEqual([15, 0]);

      doClick(up, 10);
      $rootScope.$digest();
      expect(getTimeState(false, true)).toEqual(['03', '10', 'PM']);
      expect(getModelState(true)).toEqual([15, 10]);

      doClick(down, 10);
      $rootScope.$digest();
      expect(getTimeState(false, true)).toEqual(['03', '00', 'PM']);
      expect(getModelState(true)).toEqual([15, 0]);

      doClick(down, 10);
      $rootScope.$digest();
      expect(getTimeState(false,true)).toEqual(['02', '50', 'PM']);
      expect(getModelState(true)).toEqual([14, 50]);
    });

  });

  describe('12 / 24 hour mode', function () {
    beforeEach(function() {
      $rootScope.meridian = false;
      $rootScope.time = newTime(14, 10, 20);
      element = $compile('<timepicker ng-model="time" show-meridian="meridian"></timepicker>')($rootScope);
      $rootScope.$digest();
    });

    function getMeridianTd() {
      return element.find('tr').eq(1).find('td').eq(5);
    }

    it('initially displays correct time when `show-meridian` is false', function() {
      expect(getTimeState(true)).toEqual(['14', '10', '20']);
      expect(getModelState()).toEqual([14, 10, 20]);
      expect(getMeridianTd()).toBeHidden();
    });

    it('toggles correctly between different modes', function() {
      expect(getTimeState(true)).toEqual(['14', '10', '20']);

      $rootScope.meridian = true;
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['02', '10', '20', 'PM']);
      expect(getModelState()).toEqual([14, 10, 20]);
      expect(getMeridianTd()).not.toBeHidden();

      $rootScope.meridian = false;
      $rootScope.$digest();
      expect(getTimeState(true)).toEqual(['14', '10', '20']);
      expect(getModelState()).toEqual([14, 10, 20]);
      expect(getMeridianTd()).toBeHidden();
    });

    it('handles correctly initially empty model on parent element', function() {
      $rootScope.time = null;
      element = $compile('<span ng-model="time"><timepicker show-meridian="meridian"></timepicker></span>')($rootScope);
      $rootScope.$digest();

      expect($rootScope.time).toBe(null);
    });
  });

  describe('`meridians` attribute', function() {
    beforeEach(inject(function() {
      $rootScope.meridiansArray = ['am', 'pm'];
      element = $compile('<timepicker ng-model="time" meridians="meridiansArray"></timepicker>')($rootScope);
      $rootScope.$digest();
    }));

    it('displays correctly', function () {
      expect(getTimeState()[3]).toBe('pm');
    });

    it('toggles correctly', function () {
      $rootScope.time = newTime(2, 40, 20);
      $rootScope.$digest();
      expect(getTimeState()[3]).toBe('am');
    });
  });

  describe('`readonly-input` attribute', function() {
    beforeEach(inject(function() {
      $rootScope.meridiansArray = ['am', 'pm'];
      element = $compile('<timepicker ng-model="time" readonly-input="true"></timepicker>')($rootScope);
      $rootScope.$digest();
    }));

    it('should make inputs readonly', function () {
      var inputs = element.find('input');
      expect(inputs.eq(0).attr('readonly')).toBe('readonly');
      expect(inputs.eq(1).attr('readonly')).toBe('readonly');
      expect(inputs.eq(2).attr('readonly')).toBe('readonly');
    });
  });

  describe('setting timepickerConfig steps', function() {
    var originalConfig = {};
    beforeEach(inject(function(_$compile_, _$rootScope_, timepickerConfig) {
      angular.extend(originalConfig, timepickerConfig);
      timepickerConfig.hourStep = 2;
      timepickerConfig.minuteStep = 10;
      timepickerConfig.secondStep = 10;
      timepickerConfig.showMeridian = false;
      element = $compile('<timepicker ng-model="time"></timepicker>')($rootScope);
      $rootScope.$digest();
    }));
    afterEach(inject(function(timepickerConfig) {
      // return it to the original state
      angular.extend(timepickerConfig, originalConfig);
    }));

    it('does not affect the initial value', function () {
      expect(getTimeState(true)).toEqual(['14', '40', '25']);
      expect(getModelState()).toEqual([14, 40, 25]);
    });

    it('increases / decreases hours with configured step', function() {
      var up = getHoursButton(true);
      var down = getHoursButton(false);

      doClick(up, 2);
      expect(getTimeState(true)).toEqual(['18', '40', '25']);
      expect(getModelState()).toEqual([18, 40, 25]);

      doClick(down, 3);
      expect(getTimeState(true)).toEqual(['12', '40', '25']);
      expect(getModelState()).toEqual([12, 40, 25]);
    });

    it('increases / decreases minutes with configured step', function() {
      var up = getMinutesButton(true);
      var down = getMinutesButton(false);

      doClick(up);
      expect(getTimeState(true)).toEqual(['14', '50', '25']);
      expect(getModelState()).toEqual([14, 50, 25]);

      doClick(down, 3);
      expect(getTimeState(true)).toEqual(['14', '20' , '25']);
      expect(getModelState()).toEqual([14, 20, 25]);
    });

    it('increases / decreases seconds with configured step', function() {
      var up = getSecondsButton(true);
      var down = getSecondsButton(false);

      doClick(up);
      expect(getTimeState(true)).toEqual(['14', '40', '35']);
      expect(getModelState()).toEqual([14, 40, 35]);

      doClick(down, 3);
      expect(getTimeState(true)).toEqual(['14', '40' , '05']);
      expect(getModelState()).toEqual([14, 40, 5]);
    });

  });

  describe('setting timepickerConfig meridian labels', function() {
    var originalConfig = {};
    beforeEach(inject(function(_$compile_, _$rootScope_, timepickerConfig) {
      angular.extend(originalConfig, timepickerConfig);
      timepickerConfig.meridians = ['π.μ.', 'μ.μ.'];
      timepickerConfig.showMeridian = true;
      element = $compile('<timepicker ng-model="time"></timepicker>')($rootScope);
      $rootScope.$digest();
    }));
    afterEach(inject(function(timepickerConfig) {
      // return it to the original state
      angular.extend(timepickerConfig, originalConfig);
    }));

    it('displays correctly', function () {
      expect(getTimeState()).toEqual(['02', '40', '25', 'μ.μ.']);
      expect(getModelState()).toEqual([14, 40, 25]);
    });

    it('toggles correctly', function () {
      $rootScope.time = newTime(2, 40, 20);
      $rootScope.$digest();

      expect(getTimeState()).toEqual(['02', '40', '20', 'π.μ.']);
      expect(getModelState()).toEqual([2, 40, 20]);
    });
  });

  describe('user input validation', function () {
    var changeInputValueTo;

    beforeEach(inject(function($sniffer) {
      changeInputValueTo = function (inputEl, value) {
        inputEl.val(value);
        inputEl.trigger($sniffer.hasEvent('input') ? 'input' : 'change');
        $rootScope.$digest();
      };
    }));

    function getHoursInputEl() {
      return element.find('input').eq(0);
    }

    function getMinutesInputEl() {
      return element.find('input').eq(1);
    }

    function getSecondsInputEl() {
      return element.find('input').eq(2);
    }

    it('has initially the correct time & meridian', function() {
      expect(getTimeState()).toEqual(['02', '40', '25', 'PM']);
      expect(getModelState()).toEqual([14, 40, 25]);
    });

    it('updates hours & pads on input change & pads on blur', function() {
      var el = getHoursInputEl();

      changeInputValueTo(el, 5);
      expect(getTimeState()).toEqual(['5', '40', '25', 'PM']);
      expect(getModelState()).toEqual([17, 40, 25]);

      el.blur();
      expect(getTimeState()).toEqual(['05', '40', '25', 'PM']);
      expect(getModelState()).toEqual([17, 40, 25]);
    });

    it('updates minutes & pads on input change & pads on blur', function() {
      var el = getMinutesInputEl();

      changeInputValueTo(el, 9);
      expect(getTimeState()).toEqual(['02', '9', '25', 'PM']);
      expect(getModelState()).toEqual([14, 9, 25]);

      el.blur();
      expect(getTimeState()).toEqual(['02', '09', '25', 'PM']);
      expect(getModelState()).toEqual([14, 9, 25]);
    });


    it('updates seconds & pads on input change & pads on blur', function() {
      var el = getSecondsInputEl();

      changeInputValueTo(el, 4);
      expect(getTimeState()).toEqual(['02', '40', '4', 'PM']);
      expect(getModelState()).toEqual([14, 40, 4]);

      el.blur();
      expect(getTimeState()).toEqual(['02', '40', '04', 'PM']);
      expect(getModelState()).toEqual([14, 40, 4]);
    });

    it('clears model when input hours is invalid & alerts the UI', function() {
      var el = getHoursInputEl();

      changeInputValueTo(el, 'pizza');
      expect($rootScope.time).toBe(null);
      expect(el.parent().hasClass('has-error')).toBe(true);
      expect(element.hasClass('ng-invalid-time')).toBe(true);

      changeInputValueTo(el, 8);
      el.blur();
      $rootScope.$digest();
      expect(getTimeState()).toEqual(['08', '40', '25', 'PM']);
      expect(getModelState()).toEqual([20, 40, 25]);
      expect(el.parent().hasClass('has-error')).toBe(false);
      expect(element.hasClass('ng-invalid-time')).toBe(false);
    });

    it('clears model when input minutes is invalid & alerts the UI', function() {
      var el = getMinutesInputEl();

      changeInputValueTo(el, 'pizza');
      expect($rootScope.time).toBe(null);
      expect(el.parent().hasClass('has-error')).toBe(true);
      expect(element.hasClass('ng-invalid-time')).toBe(true);

      changeInputValueTo(el, 22);
      expect(getTimeState()).toEqual(['02', '22', '25', 'PM']);
      expect(getModelState()).toEqual([14, 22, 25]);
      expect(el.parent().hasClass('has-error')).toBe(false);
      expect(element.hasClass('ng-invalid-time')).toBe(false);
    });


    it('clears model when input seconds is invalid & alerts the UI', function() {
      var el = getSecondsInputEl();

      changeInputValueTo(el, 'pizza');
      expect($rootScope.time).toBe(null);
      expect(el.parent().hasClass('has-error')).toBe(true);
      expect(element.hasClass('ng-invalid-time')).toBe(true);

      changeInputValueTo(el, 13);
      expect(getTimeState()).toEqual(['02', '40', '13', 'PM']);
      expect(getModelState()).toEqual([14, 40, 13]);
      expect(el.parent().hasClass('has-error')).toBe(false);
      expect(element.hasClass('ng-invalid-time')).toBe(false);
    });

    it('handles 12/24H mode change', function() {
      $rootScope.meridian = true;
      element = $compile('<timepicker ng-model="time" show-meridian="meridian"></timepicker>')($rootScope);
      $rootScope.$digest();

      var el = getHoursInputEl();

      changeInputValueTo(el, '16');
      expect($rootScope.time).toBe(null);
      expect(el.parent().hasClass('has-error')).toBe(true);
      expect(element.hasClass('ng-invalid-time')).toBe(true);

      $rootScope.meridian = false;
      $rootScope.$digest();
      expect(getTimeState(true)).toEqual(['16', '40', '25']);
      expect(getModelState()).toEqual([16, 40, 25]);
      expect(element.hasClass('ng-invalid-time')).toBe(false);
    });
  });

  describe('when model is not a Date', function() {
    beforeEach(inject(function() {
      element = $compile('<timepicker ng-model="time"></timepicker>')($rootScope);
    }));

    it('should not be invalid when the model is null', function() {
      $rootScope.time = null;
      $rootScope.$digest();
      expect(element.hasClass('ng-invalid-time')).toBe(false);
    });

    it('should not be invalid when the model is undefined', function() {
      $rootScope.time = undefined;
      $rootScope.$digest();
      expect(element.hasClass('ng-invalid-time')).toBe(false);
    });

    it('should not be invalid when the model is a valid string date representation', function() {
      $rootScope.time = 'September 30, 2010 15:30:10';
      $rootScope.$digest();
      expect(element.hasClass('ng-invalid-time')).toBe(false);
      expect(getTimeState()).toEqual(['03', '30', '10','PM']);
    });

    it('should be invalid when the model is not a valid string date representation', function() {
      $rootScope.time = 'pizza';
      $rootScope.$digest();
      expect(element.hasClass('ng-invalid-time')).toBe(true);
    });

    it('should return valid when the model becomes valid', function() {
      $rootScope.time = 'pizza';
      $rootScope.$digest();
      expect(element.hasClass('ng-invalid-time')).toBe(true);

      $rootScope.time = new Date();
      $rootScope.$digest();
      expect(element.hasClass('ng-invalid-time')).toBe(false);
    });

    it('should return valid when the model is cleared', function() {
      $rootScope.time = 'pizza';
      $rootScope.$digest();
      expect(element.hasClass('ng-invalid-time')).toBe(true);

      $rootScope.time = null;
      $rootScope.$digest();
      expect(element.hasClass('ng-invalid-time')).toBe(false);
    });
  });

  describe('use with `ng-required` directive', function() {
    beforeEach(inject(function() {
      $rootScope.time = null;
      element = $compile('<timepicker ng-model="time" ng-required="true"></timepicker>')($rootScope);
      $rootScope.$digest();
    }));

    it('should be invalid initially', function() {
      expect(element.hasClass('ng-invalid')).toBe(true);
    });

    it('should be valid if model has been specified', function() {
      $rootScope.time = new Date();
      $rootScope.$digest();
      expect(element.hasClass('ng-invalid')).toBe(false);
    });
  });

  describe('use with `ng-change` directive', function() {
    beforeEach(inject(function() {
      $rootScope.changeHandler = jasmine.createSpy('changeHandler');
      $rootScope.time = new Date();
      element = $compile('<timepicker ng-model="time" ng-change="changeHandler()"></timepicker>')($rootScope);
      $rootScope.$digest();
    }));

    it('should not be called initially', function() {
      expect($rootScope.changeHandler).not.toHaveBeenCalled();
    });

    it('should be called when hours / minutes buttons clicked', function() {
      var btn1 = getHoursButton(true);
      var btn2 = getMinutesButton(false);
      var btn3 = getSecondsButton(false);

      doClick(btn1, 2);
      doClick(btn2, 3);
      doClick(btn3, 1);
      $rootScope.$digest();
      expect($rootScope.changeHandler.callCount).toBe(6);
    });

    it('should not be called when model changes programatically', function() {
      $rootScope.time = new Date();
      $rootScope.$digest();
      expect($rootScope.changeHandler).not.toHaveBeenCalled();
    });
  });

});

