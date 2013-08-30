(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $(function() {
    var $signupForm, apiKey, mcApiBase, offsets, watches;
    $(document).foundation();
    if (Modernizr.is_mobile) {
      defer(function() {
        return window.scrollTo(0, 1);
      });
    }
    mcApiBase = 'https://us2.api.mailchimp.com/2.0/';
    apiKey = '3bedf01373aae0427b97f62634f70afb-us2';
    $signupForm = $('#signup-form');
    $signupForm.find('input').focus(function(e) {
      $signupForm.addClass('focusing');
      return $signupForm.find('button').html('Sign me up!');
    });
    $signupForm.find('input').blur(function(e) {
      return $signupForm.removeClass('focusing');
    });
    $signupForm.submit(function(e) {
      e.preventDefault();
      return $.getJSON(this.action + "?callback=?", $(this).serialize(), function(data) {
        if (data.Status === 400) {
          return alert("Error: " + data.Message);
        } else {
          return $signupForm.parent().addClass('submitted');
        }
      });
    });
    watches = {};
    watches.weekender = $('#weekender .svg-main').clocker();
    watches.no1 = $('#no1 .svg-main').clocker();
    watches.bn0032 = $('#bn0032 .svg-main').clocker();
    offsets = {
      local: false,
      london: 1,
      paris: 2,
      sanfrancisco: -7
    };
    $('.timezones li a').click(function(e) {
      var $el, city;
      e.preventDefault();
      $el = $(e.target);
      $el.parents('.timezones').find('li').removeClass('current');
      $el.parent().addClass('current');
      city = $el.attr('href').split('#')[1];
      return $.each(watches, function(i, watch) {
        return watch.setOffset(offsets[city]);
      });
    });
    return $('.al').click(function(e) {
      var anchor;
      e.preventDefault;
      anchor = $(e.target).attr('href');
      $.scrollTo($(anchor).offset().top, 1000);
      return false;
    });
  });

  (function($) {
    var Clocker, defer;
    Clocker = (function() {
      var updateTimer;

      function Clocker(elements, options) {
        this.elements = elements;
        this.options = options;
        this.updateTime = __bind(this.updateTime, this);

        this.startAnimation = __bind(this.startAnimation, this);

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

      updateTimer = null;

      Clocker.prototype.init = function() {
        var settings,
          _this = this;
        settings = {
          dayIndicator: '.day-indicator',
          hourIndicator: '.hour-indicator',
          minuteIndicator: '.minute-indicator',
          secondIndicator: '.second-indicator'
        };
        settings = $.extend(settings, this.options);
        return this.elements.each(function(i, el) {
          var $el;
          $el = $(el);
          _this.$hourIndicator = $el.find(settings.hourIndicator);
          _this.$minuteIndicator = $el.find(settings.minuteIndicator);
          _this.$secondIndicator = $el.find(settings.secondIndicator);
          return _this.startAnimation(false);
        });
      };

      Clocker.prototype.setOffset = function(offset) {
        if (this.offsetTimezone !== offset && (offset || this.offsetTimezone !== this.localOffset)) {
          this.offsetTimezone = offset;
          return this.startAnimation();
        }
      };

      Clocker.prototype.startAnimation = function(longTransition) {
        var events,
          _this = this;
        if (longTransition == null) {
          longTransition = true;
        }
        clearTimeout(this.updateTimer);
        this.isAnimatingHands = false;
        if (longTransition) {
          this.$hourIndicator.add(this.$minuteIndicator).addClass('long-transition');
        }
        defer(function() {
          _this.updateTime();
          return _this.isAnimatingHands = true;
        });
        events = 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend';
        this.$minuteIndicator.unbind(events);
        return this.$minuteIndicator.bind(events, function() {
          _this.isAnimatingHands = false;
          _this.$hourIndicator.add(_this.$minuteIndicator).removeClass('long-transition');
          return _this.$minuteIndicator.unbind(events);
        });
      };

      Clocker.prototype.updateTime = function() {
        var time,
          _this = this;
        time = this.getTime();
        $.each(time, function(key, val) {
          var $indicator, degree;
          $indicator = _this["$" + key + "Indicator"];
          degree = val.exactDeg || val.deg;
          if ($indicator && (!_this.isAnimatingHands || key === 'second')) {
            if (degree > 20 && degree < 30) {
              _this["" + key + "Loop"] = false;
            }
            if (degree > 0 && degree < 20 && !_this["" + key + "Loop"]) {
              _this["" + key + "Loop"] = degree;
              $indicator.addClass('no-transition');
              return defer(function() {
                _this.updateIndicator($indicator, 0);
                return defer(function() {
                  $indicator.removeClass('no-transition');
                  return defer(function() {
                    return _this.updateIndicator($indicator, degree);
                  });
                });
              });
            } else {
              return _this.updateIndicator($indicator, degree);
            }
          }
        });
        return this.updateTimer = setTimeout((function() {
          return _this.updateTime();
        }), 200);
      };

      Clocker.prototype.updateIndicator = function($indicator, deg) {
        return $indicator.css(this.prefixVendor('transform', "rotate(" + deg + "deg)"));
      };

      Clocker.prototype.getTime = function() {
        var d, exactH, exactM, exactS, h, m, mil, now, s, time, utc;
        now = new Date();
        if (this.offsetTimezone !== false) {
          utc = now.getTime() + now.getTimezoneOffset() * 60000;
          now = new Date(utc + 3600000 * this.offsetTimezone);
        }
        d = now.getDate();
        h = now.getHours();
        m = now.getMinutes();
        s = now.getSeconds();
        mil = now.getMilliseconds();
        exactS = s + mil / 1000;
        exactM = m + exactS / 60;
        exactH = h + exactM / 60;
        exactM = exactM + h * 60;
        return time = {
          day: {
            val: d,
            deg: this.valToDeg(d, 31)
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

}).call(this);
