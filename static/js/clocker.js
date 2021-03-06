(function($) {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  var Clocker, defer;
  Clocker = (function() {
    function Clocker(elements, options) {
      this.elements = elements;
      this.options = options;
      this.getTime = __bind(this.getTime, this);
      this.getRawTime = __bind(this.getRawTime, this);
      this.updateTimeAnalog = __bind(this.updateTimeAnalog, this);
      this.updateMeridiem = __bind(this.updateMeridiem, this);
      this.updateTimeDigital = __bind(this.updateTimeDigital, this);
      this.updateTime = __bind(this.updateTime, this);
      this.pause = __bind(this.pause, this);
      this.playAnalog = __bind(this.playAnalog, this);
      this.playDigital = __bind(this.playDigital, this);
      this.play = __bind(this.play, this);
      this.setOffset = __bind(this.setOffset, this);
      this.init();
      this.$ = this.elements;
    }

    Clocker.prototype.hourLoop = false;

    Clocker.prototype.minuteLoop = false;

    Clocker.prototype.secondLoop = false;

    Clocker.prototype.localOffset = (new Date()).getTimezoneOffset() / -60;

    Clocker.prototype.offsetTimezone = false;

    Clocker.prototype.isAnimatingHands = false;

    Clocker.prototype.isAnimatingDigital = false;

    Clocker.prototype.updateTimer = null;

    Clocker.prototype.oldTime = new Date((new Date()).setHours(0, 0, 0));

    Clocker.prototype.firstPlay = true;

    Clocker.prototype.init = function() {
      var settings;
      settings = {
        dayIndicator: '.day-indicator',
        dateIndicator: '.date-indicator',
        hourIndicator: '.hour-indicator',
        minuteIndicator: '.minute-indicator',
        secondIndicator: '.second-indicator',
        dateMultiplier: 1,
        hourMultiplier: 1,
        minuteMultiplier: 1,
        secondMultiplier: 1,
        analog: true,
        digital: false,
        militaryTime: false
      };
      this.settings = $.extend(settings, this.options);
      return this.elements.each((function(_this) {
        return function(i, el) {
          var $el;
          _this.$ = $el = $(el);
          _this.$container = _this.$.parent();
          _this.$dayIndicator = $el.find(settings.dayIndicator);
          _this.$dateIndicator = $el.find(settings.dateIndicator);
          _this.$hourIndicator = $el.find(settings.hourIndicator);
          _this.$minuteIndicator = $el.find(settings.minuteIndicator);
          _this.$secondIndicator = $el.find(settings.secondIndicator);
          return _this.play();
        };
      })(this));
    };

    Clocker.prototype.setOffset = function(offset) {
      if (this.offsetTimezone !== offset && (offset || this.offsetTimezone !== this.localOffset)) {
        this.oldTime = this.getRawTime();
        this.offsetTimezone = offset;
        return this.play();
      }
    };

    Clocker.prototype.play = function(longTransition) {
      if (longTransition == null) {
        longTransition = true;
      }
      clearTimeout(this.updateTimer);
      if (this.settings.analog) {
        this.playAnalog(longTransition);
      }
      if (this.settings.digital) {
        this.playDigital(longTransition);
      }
      return this.firstPlay = false;
    };

    Clocker.prototype.playDigital = function(longTransition) {
      if (longTransition) {
        this.playState = 'playing';
        return this.animateDigital(this.oldTime);
      } else {
        return this.updateTime();
      }
    };

    Clocker.prototype.animateDigital = function(startTime, callback) {
      var diff, duration, endDate, endDay, endHours, endMinutes, endSeconds, finished, interval, negative, newTime, startDate, startDay, startHours, startMinutes, startSeconds, stepAnimate;
      duration = 3500;
      interval = 30;
      newTime = this.getRawTime();
      finished = 0;
      this.isAnimatingDigital = true;
      callback = (function(_this) {
        return function() {
          _this.isAnimatingDigital = false;
          return _this.updateTime();
        };
      })(this);
      stepAnimate = (function(_this) {
        return function(current_time, start_value, end_value, total_time, step) {
          var currentVal;
          currentVal = Math.round(start_value + (end_value - start_value) * jQuery.easing.easeInOutExpo(null, current_time, 0, 1, total_time));
          step(currentVal);
          if (current_time > total_time) {
            finished++;
            if (finished >= 3) {
              callback();
            }
            return;
          }
          return setTimeout((function() {
            return stepAnimate(current_time + interval, start_value, end_value, total_time, step);
          }), interval);
        };
      })(this);
      diff = newTime - startTime + duration;
      negative = diff < 0;
      startDate = startTime.getDate() * !this.firstPlay;
      endDate = newTime.getDate();
      startDay = startTime.getDay() * !this.firstPlay + 7 * negative;
      endDay = startDay + (endDate - startDate);
      startHours = startTime.getHours() + 24 * negative;
      endHours = startHours + Math.floor(diff / (60 * 60 * 1000));
      startMinutes = startTime.getMinutes() + 12 * 60 * negative;
      endMinutes = startMinutes + Math.floor(diff / (60 * 1000));
      startSeconds = startTime.getSeconds() + 12 * 60 * 60 * negative;
      endSeconds = startSeconds + (Math.floor(diff / 1000) % 60) + (endMinutes - endMinutes % 60) + 480;
      stepAnimate(0, startDay, endDay, duration, (function(_this) {
        return function(val) {
          return _this.updateIndicatorDigital(_this.$dayIndicator, _this.dayNames[val % 7]);
        };
      })(this));
      stepAnimate(0, startDate, endDate, duration, (function(_this) {
        return function(val) {
          return _this.updateIndicatorDigital(_this.$dateIndicator, val);
        };
      })(this));
      stepAnimate(0, startHours, endHours, duration, (function(_this) {
        return function(val) {
          _this.updateMeridiem(val);
          return _this.updateIndicatorDigital(_this.$hourIndicator, val % 12 || 12);
        };
      })(this));
      stepAnimate(0, startMinutes, endMinutes, duration, (function(_this) {
        return function(val) {
          return _this.updateIndicatorDigital(_this.$minuteIndicator, val % 60);
        };
      })(this));
      return stepAnimate(0, startSeconds, endSeconds, duration, (function(_this) {
        return function(val) {
          return _this.updateIndicatorDigital(_this.$secondIndicator, val % 60);
        };
      })(this));
    };

    Clocker.prototype.playAnalog = function(longTransition) {
      var events;
      this.playState = 'playing';
      this.isAnimatingHands = false;
      if (longTransition) {
        this.$hourIndicator.add(this.$minuteIndicator).add(this.$dateIndicator).addClass('long-transition');
      }
      defer((function(_this) {
        return function() {
          _this.updateTime();
          return _this.isAnimatingHands = true;
        };
      })(this));
      events = 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend';
      this.$minuteIndicator.unbind(events);
      return this.$minuteIndicator.bind(events, (function(_this) {
        return function() {
          _this.isAnimatingHands = false;
          _this.$hourIndicator.add(_this.$minuteIndicator).removeClass('long-transition');
          return _this.$minuteIndicator.unbind(events);
        };
      })(this));
    };

    Clocker.prototype.pause = function() {
      clearTimeout(this.updateTimer);
      return this.playState = 'paused';
    };

    Clocker.prototype.updateTime = function() {
      var time;
      time = this.getTime();
      if (this.settings.analog) {
        this.updateTimeAnalog(time);
      }
      if (this.settings.digital) {
        this.updateTimeDigital(time);
      }
      return this.updateTimer = setTimeout(((function(_this) {
        return function() {
          return _this.updateTime();
        };
      })(this)), 200);
    };

    Clocker.prototype.updateTimeDigital = function(time) {
      if (!this.isAnimatingDigital) {
        return $.each(time, (function(_this) {
          return function(key, val) {
            var $indicator, value;
            $indicator = _this["$" + key + "Indicator"];
            if (key === 'day') {
              value = _this.dayNames[val.val];
            } else {
              value = val.val;
            }
            return _this.updateIndicatorDigital($indicator, value);
          };
        })(this));
      }
    };

    Clocker.prototype.updateMeridiem = function(hour) {
      var newMeridiem;
      this.$.removeClass('meridiem-am meridiem-pm');
      newMeridiem = Math.floor(hour / 12) % 2 === 0 ? 'am' : 'pm';
      return this.$.addClass("meridiem-" + newMeridiem);
    };

    Clocker.prototype.updateIndicatorDigital = function($indicator, val) {
      var className, _i, _len, _ref;
      _ref = $indicator.attr('class').split(' ');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        className = _ref[_i];
        if (className.match(/digit-val-.+/)) {
          $indicator.removeClass(className);
        }
      }
      return $indicator.addClass("digit-val-" + val);
    };

    Clocker.prototype.updateTimeAnalog = function(time) {
      return $.each(time, (function(_this) {
        return function(key, val) {
          var $indicator, degree, multiplier;
          $indicator = _this["$" + key + "Indicator"];
          multiplier = _this.settings["" + key + "Multiplier"];
          degree = val.exactDeg || val.deg;
          if ($indicator && (!_this.isAnimatingHands || key === 'second')) {
            if (degree > 20 && degree < 30) {
              _this["" + key + "Loop"] = false;
            }
            if (degree > 0 && degree < 20 && !_this["" + key + "Loop"]) {
              _this["" + key + "Loop"] = degree;
              $indicator.addClass('no-transition');
              return defer(function() {
                _this.updateIndicatorAnalog($indicator, 0, 1);
                return defer(function() {
                  $indicator.removeClass('no-transition');
                  return defer(function() {
                    return _this.updateIndicatorAnalog($indicator, degree, multiplier);
                  });
                });
              });
            } else {
              return _this.updateIndicatorAnalog($indicator, degree, multiplier);
            }
          }
        };
      })(this));
    };

    Clocker.prototype.updateIndicatorAnalog = function($indicator, deg, multiplier) {
      return $indicator.css(this.prefixVendor('transform', "rotate(" + (deg * multiplier) + "deg)"));
    };

    Clocker.prototype.getRawTime = function() {
      var now, utc;
      now = new Date();
      if (this.offsetTimezone !== false) {
        utc = now.getTime() + now.getTimezoneOffset() * 60000;
        now = new Date(utc + 3600000 * this.offsetTimezone);
      }
      this.oldTime = now;
      return now;
    };

    Clocker.prototype.getTime = function() {
      var d, day, exactH, exactM, exactS, h, m, mil, now, s, time;
      now = this.getRawTime();
      day = now.getDay();
      d = now.getDate();
      h = now.getHours();
      m = now.getMinutes();
      s = now.getSeconds();
      mil = now.getMilliseconds();
      exactS = s + mil / 1000;
      exactM = m + exactS / 60;
      exactH = h + exactM / 60;
      exactM = exactM + h * 60;
      if (this.settings.digital && !this.settings.militaryTime) {
        h = h % 12 || 12;
      }
      return time = {
        day: {
          val: day,
          deg: this.valToDeg(day, 7)
        },
        date: {
          val: d,
          deg: this.valToDeg(d - 1, 31)
        },
        hour: {
          val: h,
          deg: this.valToDeg(h, 12),
          exactDeg: this.valToDeg(exactH, 12)
        },
        minute: {
          val: m,
          deg: this.valToDeg(m, 60),
          exactDeg: this.valToDeg(exactM, 60)
        },
        second: {
          val: s,
          deg: this.valToDeg(s, 60)
        }
      };
    };

    Clocker.prototype.dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    Clocker.prototype.valToDeg = function(val, total) {
      return (360 * val / total) || 360;
    };

    Clocker.prototype.prefixVendor = function(property, val) {
      var prefix, properties, _fn, _i, _len, _ref;
      properties = {
        property: val
      };
      _ref = this.cssVendorPrefixes;
      _fn = function(prefix) {
        return properties["" + prefix + "-" + property] = val;
      };
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        prefix = _ref[_i];
        _fn(prefix);
      }
      return properties;
    };

    Clocker.prototype.cssVendorPrefixes = ['-webkit', '-moz', '-ms', '-o'];

    return Clocker;

  })();
  defer = function(callback) {
    return setTimeout(callback, 1);
  };
  return jQuery.fn.clocker = function(options) {
    var clocker;
    clocker = new Clocker(this, options);
    return clocker;
  };
})(jQuery);
