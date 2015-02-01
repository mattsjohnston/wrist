$ ->
  $(document).foundation()
  if Modernizr.is_mobile
    defer -> window.scrollTo(0, 1)

  # Signup form focus animation trigger
  $signupForm = $('#signup-form')
  $signupForm.find('input').focus (e) ->
    $signupForm.addClass 'focusing'
    $signupForm.find('button').html 'Sign me up!'
  $signupForm.find('input').blur (e) ->
    $signupForm.removeClass 'focusing'
    $signupForm.find('button').html 'Get the Newsletter'

  watches = {}
  watches.weekender = $('#weekender .svg-main').clocker()
  watches.no1 = $('#no1 .svg-main').clocker()
  watches.bn0032 = $('#bn0032 .svg-main').clocker()
  watches.normal = $('#normal .svg-main').clocker
    hourIndicator: '.hour-indicator, .hour-shadow'
    secondIndicator: '.second-indicator, .second-shadow'
    minuteIndicator: '.minute-indicator, .minute-shadow'
  watches.polygon = $('#polygon .svg-main').clocker dateMultiplier: -1
  watches.f91w = $('#f91w .svg-main').clocker
    analog: false
    digital: true
  watches.theFitz = $('#gownandoars-thefitz .svg-main').clocker()
  watches.avi84001 = $('#avi8-4001-01 .svg-main').clocker()
  watches.avi84001 = $('#mvmt-tan .svg-main').clocker()

  # set the timezone offsets for the toggle
  offsets =
    local: false
    london: 1
    paris: 2
    sanfrancisco: -7

  toggleVisibleWatches = ->
    $.each watches, (i, watch) ->
      if watch.$container.visible(true)
        if watch.playState != 'playing'
          watch.play(false)
          # watch.$container.removeClass 'hidden'
      else if watch.playState != 'paused'
        watch.pause()
        # watch.$container.addClass 'hidden'

  toggleVisibleWatches()
  $(document).on 'scroll', toggleVisibleWatches

  $('.timezones li a').click (e) ->
    e.preventDefault()
    $el = $(e.target)
    $el.parents('.timezones').find('li').removeClass('current')
    $el.parent().addClass('current')
    city = $el.attr('href').split('#')[1]
    $.each watches, (i, watch) ->
      watch.setOffset offsets[city]
      return

  $('.al').click (e) ->
    e.preventDefault
    anchor = $(e.target).attr 'href'
    $.scrollTo $(anchor).offset().top, 1000
    return false

(($) ->
  class Clocker
    constructor: (@elements, @options) ->
      @init()
      @$ = @elements

    hourLoop: false
    minuteLoop: false
    secondLoop: false
    localOffset: (new Date()).getTimezoneOffset() / -60
    offsetTimezone: false
    isAnimatingHands: false
    isAnimatingDigital: false
    updateTimer: null
    oldTime: new Date((new Date()).setHours(0, 0, 0))
    firstPlay: true

    init: ->
      settings =
        dayIndicator: '.day-indicator'
        dateIndicator: '.date-indicator'
        hourIndicator: '.hour-indicator'
        minuteIndicator: '.minute-indicator'
        secondIndicator: '.second-indicator'
        dateMultiplier: 1
        hourMultiplier: 1
        minuteMultiplier: 1
        secondMultiplier: 1
        analog: true
        digital: false
        militaryTime: false

      # Merge default settings with options.
      @settings = $.extend settings, @options

      @elements.each (i, el) =>
        @$ = $el = $(el)
        @$container = @$.parent()
        @$dayIndicator = $el.find(settings.dayIndicator)
        @$dateIndicator = $el.find(settings.dateIndicator)
        @$hourIndicator = $el.find(settings.hourIndicator)
        @$minuteIndicator = $el.find(settings.minuteIndicator)
        @$secondIndicator = $el.find(settings.secondIndicator)
        @play()

    setOffset: (offset) =>
      if @offsetTimezone != offset && (offset || @offsetTimezone != @localOffset)
        @oldTime = @getRawTime()
        @offsetTimezone = offset
        @play()

    play: (longTransition = true) =>
      clearTimeout @updateTimer
      @playAnalog(longTransition) if @settings.analog
      @playDigital(longTransition) if @settings.digital
      @firstPlay = false

    playDigital: (longTransition) =>
      if longTransition
        @playState = 'playing'
        @animateDigital(@oldTime)
      else
        @updateTime()

    animateDigital: (startTime, callback) ->
      duration = 3500
      interval = 30
      newTime = @getRawTime()
      finished = 0
      @isAnimatingDigital = true

      callback = =>
        @isAnimatingDigital = false
        @updateTime()

      stepAnimate = (current_time, start_value, end_value, total_time, step) =>
        currentVal = Math.round start_value + (end_value - start_value) * jQuery.easing.easeInOutExpo(null, current_time, 0, 1, total_time)
        step(currentVal)
        if current_time > total_time
          finished++
          callback() if finished >= 3
          return
        setTimeout (=>
          stepAnimate(current_time + interval, start_value, end_value, total_time, step)
        ), interval

      diff = newTime - startTime + duration
      negative = diff < 0
      startDate = startTime.getDate() * !@firstPlay
      endDate = newTime.getDate()
      startDay = startTime.getDay() * !@firstPlay + 7 * negative
      endDay = startDay + (endDate - startDate)
      startHours = startTime.getHours() + 24 * negative
      endHours = startHours + Math.floor(diff / (60*60*1000))
      startMinutes = startTime.getMinutes() + 12 * 60 * negative
      endMinutes = startMinutes + Math.floor(diff / (60*1000))
      startSeconds = startTime.getSeconds() + 12 * 60 * 60 * negative
      endSeconds = startSeconds + (Math.floor(diff / 1000) % 60) + (endMinutes - endMinutes % 60) + 480
      stepAnimate 0, startDay, endDay, duration, (val) =>
        @updateIndicatorDigital(@$dayIndicator, @dayNames[val % 7])
      stepAnimate 0, startDate, endDate, duration, (val) =>
        @updateIndicatorDigital @$dateIndicator, val
      stepAnimate 0, startHours, endHours, duration, (val) =>
        @updateMeridiem(val)
        @updateIndicatorDigital @$hourIndicator, val % 12 || 12
      stepAnimate 0, startMinutes, endMinutes, duration, (val) =>
        @updateIndicatorDigital @$minuteIndicator, val % 60
      stepAnimate 0, startSeconds, endSeconds, duration, (val) =>
        @updateIndicatorDigital @$secondIndicator, val % 60

    playAnalog: (longTransition) =>
      @playState = 'playing'
      @isAnimatingHands = false
      @$hourIndicator.add(@$minuteIndicator).add(@$dateIndicator).addClass('long-transition') if longTransition
      defer =>
        @updateTime()
        @isAnimatingHands = true
      events = 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend'
      @$minuteIndicator.unbind events
      @$minuteIndicator.bind events, =>
        @isAnimatingHands = false
        @$hourIndicator.add(@$minuteIndicator).removeClass('long-transition')
        @$minuteIndicator.unbind events

    pause: =>
      clearTimeout @updateTimer
      @playState = 'paused'

    updateTime: =>
      time = @getTime()
      @updateTimeAnalog(time) if @settings.analog
      @updateTimeDigital(time) if @settings.digital
      @updateTimer = setTimeout((=> @updateTime()), 200)

    updateTimeDigital: (time) =>
      unless @isAnimatingDigital
        $.each time, (key, val) =>
          $indicator = @["$#{key}Indicator"]
          if key == 'day'
            value = @dayNames[val.val]
          else
            value = val.val
          @updateIndicatorDigital($indicator, value)

    updateMeridiem: (hour) =>
      @$.removeClass 'meridiem-am meridiem-pm'
      newMeridiem = if Math.floor(hour/12) % 2 == 0 then 'am' else 'pm'
      @$.addClass "meridiem-#{newMeridiem}"

    updateIndicatorDigital: ($indicator, val) ->
      for className in $indicator.attr('class').split(' ')
        if className.match(/digit-val-.+/)
          $indicator.removeClass className
      $indicator.addClass("digit-val-#{val}")

    updateTimeAnalog: (time) =>
      $.each time, (key, val) =>
        $indicator = @["$#{key}Indicator"]
        multiplier = @settings["#{key}Multiplier"]
        degree = val.exactDeg || val.deg
        if $indicator && (!@isAnimatingHands || key == 'second')
          if degree > 20 && degree < 30
            @["#{key}Loop"] = false
          if degree > 0 && degree < 20 && !@["#{key}Loop"]
            @["#{key}Loop"] = degree
            $indicator.addClass('no-transition')
            defer =>
              @updateIndicatorAnalog($indicator, 0, 1)
              defer =>
                $indicator.removeClass 'no-transition'
                defer => @updateIndicatorAnalog($indicator, degree, multiplier)
          else
            @updateIndicatorAnalog($indicator, degree, multiplier)

    updateIndicatorAnalog: ($indicator, deg, multiplier) ->
      $indicator.css @prefixVendor('transform', "rotate(#{deg*multiplier}deg)")

    getRawTime: =>
      now = new Date()
      if @offsetTimezone != false
        utc = now.getTime() + now.getTimezoneOffset() * 60000
        now = new Date(utc + 3600000 * @offsetTimezone)
      @oldTime = now
      return now

    getTime: =>
      now = @getRawTime()

      day = now.getDay()
      d = now.getDate()
      h = now.getHours()
      m = now.getMinutes()
      s = now.getSeconds()
      mil = now.getMilliseconds()

      exactS = s + mil/1000
      exactM = m + exactS/60
      exactH = h + exactM/60

      exactM = exactM + h*60

      if @settings.digital && !@settings.militaryTime
        h = h % 12 || 12

      time =
        day:
          val: day
          deg: @valToDeg(day, 7)
        date:
          val: d
          deg: @valToDeg(d-1, 31)
        hour:
          val: h
          deg: @valToDeg(h, 12)
          exactDeg: @valToDeg(exactH, 12)
        minute:
          val: m
          deg: @valToDeg(m, 60)
          exactDeg: @valToDeg(exactM, 60)
        second:
          val: s
          deg: @valToDeg(s, 60)

    dayNames: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

    # Takes a value to be converted, and the total
    # number, which represents 360 degrees.
    valToDeg: (val, total) ->
      (360 * val / total) || 360

    prefixVendor: (property, val) ->
      properties = { property: val }
      ((prefix) -> properties["#{prefix}-#{property}"] = val)(prefix) for prefix in @cssVendorPrefixes
      return properties

    cssVendorPrefixes: [
      '-webkit'
      '-moz'
      '-ms'
      '-o'
    ]

  defer = (callback) ->
    setTimeout callback, 1

  jQuery.fn.clocker = (options) ->
    clocker = new Clocker(this, options)
    return clocker

)(jQuery)


# mailchimp form
( ->

  mce_preload_check = ->
    return  if mce_preload_checks > 40
    mce_preload_checks++
    script = document.createElement("script")
    script.type = "text/javascript"
    script.src = "http://downloads.mailchimp.com/js/jquery.form-n-validate.js"
    head.appendChild script
    try
      validatorLoaded = $("#fake-form").validate({})
    catch err
      setTimeout (->
        mce_preload_check()
      ), 250
      return
    mce_init_form()
  mce_init_form = ->
    $ ->
      $signupForm = $('#signup-form')

      options =
        errorClass: "mce_inline_error"
        errorElement: "div"
        onkeyup: ->
        onfocusout: ->
        onblur: ->

      mce_validator = $signupForm.validate(options)
      $signupForm.unbind "submit" #remove the validator so we can get into beforeSubmit on the ajaxform, which then calls the validator
      options =
        url: "http://catalytic-design.us2.list-manage1.com/subscribe/post-json?u=e9312d1e7264ab780493019da&id=26b7366e0d&c=?"
        type: "GET"
        dataType: "json"
        contentType: "application/json; charset=utf-8"
        success: mce_success_cb

      $signupForm.ajaxForm options

  mce_success_cb = (resp) ->
    if resp.result is "success"
      $('#signup-form').parent().addClass 'submitted'
    else
      index = -1
      msg = undefined
      try
        parts = resp.msg.split(" - ", 2)
        if parts[1] is `undefined`
          msg = resp.msg
        else
          i = parseInt(parts[0])
          if i.toString() is parts[0]
            index = parts[0]
            msg = parts[1]
          else
            index = -1
            msg = resp.msg
      catch e
        index = -1
        msg = resp.msg
      alert msg
  fnames = new Array()
  ftypes = new Array()
  fnames[0] = "EMAIL"
  ftypes[0] = "email"
  head = document.getElementsByTagName("head")[0]
  setTimeout (->
    mce_preload_check()
  ), 250
  mce_preload_checks = 0
)()