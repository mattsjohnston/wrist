$ ->
  $(document).foundation()
  if Modernizr.is_mobile
    defer -> window.scrollTo(0, 1)

  # Signup form focus animation trigger
  mcApiBase = 'https://us2.api.mailchimp.com/2.0/'
  apiKey = '3bedf01373aae0427b97f62634f70afb-us2'
  $signupForm = $('#signup-form')
  $signupForm.find('input').focus (e) ->
    $signupForm.addClass 'focusing'
    $signupForm.find('button').html 'Sign me up!'
  $signupForm.find('input').blur (e) ->
    $signupForm.removeClass 'focusing'
  $signupForm.submit (e) ->
    e.preventDefault()
    $.getJSON @action + "?callback=?", $(this).serialize(), (data) ->
      if data.Status is 400
        alert "Error: " + data.Message
      else # 200
        $signupForm.parent().addClass 'submitted'

  watches = {}
  watches.weekender = $('#weekender .svg-main').clocker()
  watches.no1 = $('#no1 .svg-main').clocker()
  watches.bn0032 = $('#bn0032 .svg-main').clocker()

  offsets =
    local: false
    london: 1
    paris: 2
    sanfrancisco: -7

  $('.timezones li a').click (e) ->
    e.preventDefault()
    $el = $(e.target)
    $el.parents('.timezones').find('li').removeClass('current')
    $el.parent().addClass('current')
    city = $el.attr('href').split('#')[1]
    $.each watches, (i, watch) -> watch.setOffset offsets[city]

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
    updateTimer = null

    init: ->
      settings =
        dayIndicator: '.day-indicator'
        hourIndicator: '.hour-indicator'
        minuteIndicator: '.minute-indicator'
        secondIndicator: '.second-indicator'

      # Merge default settings with options.
      settings = $.extend settings, @options

      @elements.each (i, el) =>
        $el = $(el)
        @$dayIndicator = $el.find(settings.dayIndicator)
        @$hourIndicator = $el.find(settings.hourIndicator)
        @$minuteIndicator = $el.find(settings.minuteIndicator)
        @$secondIndicator = $el.find(settings.secondIndicator)
        @startAnimation(false)

    setOffset: (offset) =>
      if @offsetTimezone != offset && (offset || @offsetTimezone != @localOffset)
        @offsetTimezone = offset
        @startAnimation()

    startAnimation: (longTransition = true) =>
      clearTimeout @updateTimer
      @isAnimatingHands = false
      @$hourIndicator.add(@$minuteIndicator).add(@$dayIndicator).addClass('long-transition') if longTransition
      defer =>
        @updateTime()
        @isAnimatingHands = true
      events = 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend'
      @$minuteIndicator.unbind events
      @$minuteIndicator.bind events, =>
        @isAnimatingHands = false
        @$hourIndicator.add(@$minuteIndicator).removeClass('long-transition')
        @$minuteIndicator.unbind events

    updateTime: =>
      time = @getTime()
      $.each time, (key, val) =>
        $indicator = @["$#{key}Indicator"]
        degree = val.exactDeg || val.deg
        if $indicator && (!@isAnimatingHands || key == 'second')
          if degree > 20 && degree < 30
            @["#{key}Loop"] = false
          if degree > 0 && degree < 20 && !@["#{key}Loop"]
            @["#{key}Loop"] = degree
            $indicator.addClass('no-transition')
            defer =>
              @updateIndicator($indicator, 0)
              defer =>
                $indicator.removeClass 'no-transition'
                defer => @updateIndicator($indicator, degree)
          else
            @updateIndicator($indicator, degree)

      @updateTimer = setTimeout (=>
        @updateTime()
      ), 200

    updateIndicator: ($indicator, deg) ->
      $indicator.css @prefixVendor('transform', "rotate(#{deg}deg)")

    getTime: ->
      now = new Date()

      if @offsetTimezone != false
        utc = now.getTime() + now.getTimezoneOffset() * 60000
        now = new Date(utc + 3600000 * @offsetTimezone)

      d = now.getDate()
      h = now.getHours()
      m = now.getMinutes()
      s = now.getSeconds()
      mil = now.getMilliseconds()

      exactS = s + mil/1000
      exactM = m + exactS/60
      exactH = h + exactM/60

      exactM = exactM + h*60

      time =
        day:
            val: d
            deg: @valToDeg(d, 31)
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