(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $(function() {
    var offsets, toggleVisibleWatches, watches;

    $(document).foundation();
    if (Modernizr.is_mobile) {
      defer(function() {
        return window.scrollTo(0, 1);
      });
    }
    watches = {};
    watches.weekender = $('#weekender .svg-main').clocker();
    watches.no1 = $('#no1 .svg-main').clocker();
    watches.bn0032 = $('#bn0032 .svg-main').clocker();
    watches.normal = $('#normal .svg-main').clocker({
      hourIndicator: '.hour-indicator, .hour-shadow',
      secondIndicator: '.second-indicator, .second-shadow',
      minuteIndicator: '.minute-indicator, .minute-shadow'
    });
    watches.polygon = $('#polygon .svg-main').clocker({
      dayMultiplier: -1
    });
    offsets = {
      local: false,
      london: 1,
      paris: 2,
      sanfrancisco: -7
    };
    toggleVisibleWatches = function() {
      return $.each(watches, function(i, watch) {
        if (watch.$.visible(true)) {
          return watch.play();
        } else {
          return watch.pause();
        }
      });
    };
    toggleVisibleWatches();
    $(document).on('scroll', toggleVisibleWatches);
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
        this.pause = __bind(this.pause, this);
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

      updateTimer = null;

      Clocker.prototype.init = function() {
        var settings,
          _this = this;

        settings = {
          dayIndicator: '.day-indicator',
          hourIndicator: '.hour-indicator',
          minuteIndicator: '.minute-indicator',
          secondIndicator: '.second-indicator',
          dayMultiplier: 1,
          hourMultiplier: 1,
          minuteMultiplier: 1,
          secondMultiplier: 1
        };
        this.settings = $.extend(settings, this.options);
        return this.elements.each(function(i, el) {
          var $el;

          _this.$ = $el = $(el);
          _this.$dayIndicator = $el.find(settings.dayIndicator);
          _this.$hourIndicator = $el.find(settings.hourIndicator);
          _this.$minuteIndicator = $el.find(settings.minuteIndicator);
          _this.$secondIndicator = $el.find(settings.secondIndicator);
          return _this.play(false);
        });
      };

      Clocker.prototype.setOffset = function(offset) {
        if (this.offsetTimezone !== offset && (offset || this.offsetTimezone !== this.localOffset)) {
          this.offsetTimezone = offset;
          return this.play();
        }
      };

      Clocker.prototype.play = function(longTransition) {
        var events,
          _this = this;

        if (longTransition == null) {
          longTransition = true;
        }
        this.pause();
        this.isAnimatingHands = false;
        if (longTransition) {
          this.$hourIndicator.add(this.$minuteIndicator).add(this.$dayIndicator).addClass('long-transition');
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

      Clocker.prototype.pause = function() {
        return clearTimeout(this.updateTimer);
      };

      Clocker.prototype.updateTime = function() {
        var time,
          _this = this;

        time = this.getTime();
        $.each(time, function(key, val) {
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
                _this.updateIndicator($indicator, 0, 1);
                return defer(function() {
                  $indicator.removeClass('no-transition');
                  return defer(function() {
                    return _this.updateIndicator($indicator, degree, multiplier);
                  });
                });
              });
            } else {
              return _this.updateIndicator($indicator, degree, multiplier);
            }
          }
        });
        return this.updateTimer = setTimeout((function() {
          return _this.updateTime();
        }), 200);
      };

      Clocker.prototype.updateIndicator = function($indicator, deg, multiplier) {
        return $indicator.css(this.prefixVendor('transform', "rotate(" + (deg * multiplier) + "deg)"));
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

  (function() {
    var fnames, ftypes, head, mce_init_form, mce_preload_check, mce_preload_checks, mce_success_cb;

    mce_preload_check = function() {
      var err, script, validatorLoaded;

      if (mce_preload_checks > 40) {
        return;
      }
      mce_preload_checks++;
      script = document.createElement("script");
      script.type = "text/javascript";
      script.src = "http://downloads.mailchimp.com/js/jquery.form-n-validate.js";
      head.appendChild(script);
      try {
        validatorLoaded = $("#fake-form").validate({});
      } catch (_error) {
        err = _error;
        setTimeout((function() {
          return mce_preload_check();
        }), 250);
        return;
      }
      return mce_init_form();
    };
    mce_init_form = function() {
      return $(function() {
        var $signupForm, mce_validator, options;

        $signupForm = $('#signup-form');
        options = {
          errorClass: "mce_inline_error",
          errorElement: "div",
          onkeyup: function() {},
          onfocusout: function() {},
          onblur: function() {}
        };
        mce_validator = $signupForm.validate(options);
        $signupForm.unbind("submit");
        options = {
          url: "http://catalytic-design.us2.list-manage1.com/subscribe/post-json?u=e9312d1e7264ab780493019da&id=26b7366e0d&c=?",
          type: "GET",
          dataType: "json",
          contentType: "application/json; charset=utf-8",
          success: mce_success_cb
        };
        return $signupForm.ajaxForm(options);
      });
    };
    mce_success_cb = function(resp) {
      var e, i, index, msg, parts;

      if (resp.result === "success") {
        return $('#signup-form').parent().addClass('submitted');
      } else {
        index = -1;
        msg = void 0;
        try {
          parts = resp.msg.split(" - ", 2);
          if (parts[1] === undefined) {
            msg = resp.msg;
          } else {
            i = parseInt(parts[0]);
            if (i.toString() === parts[0]) {
              index = parts[0];
              msg = parts[1];
            } else {
              index = -1;
              msg = resp.msg;
            }
          }
        } catch (_error) {
          e = _error;
          index = -1;
          msg = resp.msg;
        }
        return alert(msg);
      }
    };
    fnames = new Array();
    ftypes = new Array();
    fnames[0] = "EMAIL";
    ftypes[0] = "email";
    head = document.getElementsByTagName("head")[0];
    setTimeout((function() {
      return mce_preload_check();
    }), 250);
    return mce_preload_checks = 0;
  })();

}).call(this);
