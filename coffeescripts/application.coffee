$ ->
  $(document).foundation()
  if Modernizr.is_mobile
    defer -> window.scrollTo(0, 1)

  watches = {}
  watches.weekender = $('#weekender .svg-main').clocker()
  watches.no1 = $('#no1 .svg-main').clocker()
  watches.bn0032 = $('#bn0032 .svg-main').clocker()
  watches.normal = $('#normal .svg-main').clocker
    hourIndicator: '.hour-indicator, .hour-shadow'
    secondIndicator: '.second-indicator, .second-shadow'
    minuteIndicator: '.minute-indicator, .minute-shadow'
  watches.polygon = $('#polygon .svg-main').clocker dayMultiplier: -1

  # set the timezone offsets for the toggle
  offsets =
    local: false
    london: 1
    paris: 2
    sanfrancisco: -7

  toggleVisibleWatches = ->
    $.each watches, (i, watch) ->
      if watch.$.visible(true)
        watch.play()
      else
        watch.pause()

  toggleVisibleWatches()
  $(document).on 'scroll', toggleVisibleWatches

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
        dayMultiplier: 1
        hourMultiplier: 1
        minuteMultiplier: 1
        secondMultiplier: 1

      # Merge default settings with options.
      @settings = $.extend settings, @options

      @elements.each (i, el) =>
        @$ = $el = $(el)
        @$dayIndicator = $el.find(settings.dayIndicator)
        @$hourIndicator = $el.find(settings.hourIndicator)
        @$minuteIndicator = $el.find(settings.minuteIndicator)
        @$secondIndicator = $el.find(settings.secondIndicator)
        @play(false)

    setOffset: (offset) =>
      if @offsetTimezone != offset && (offset || @offsetTimezone != @localOffset)
        @offsetTimezone = offset
        @play()

    play: (longTransition = true) =>
      @pause()
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

    pause: =>
      clearTimeout @updateTimer

    updateTime: =>
      time = @getTime()
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
              @updateIndicator($indicator, 0, 1)
              defer =>
                $indicator.removeClass 'no-transition'
                defer => @updateIndicator($indicator, degree, multiplier)
          else
            @updateIndicator($indicator, degree, multiplier)

      @updateTimer= setTimeout (=>
                      @updateTime()
                    ), 200

    updateIndicator: ($indicator, deg, multiplier) ->
      $indicator.css @prefixVendor('transform', "rotate(#{deg*multiplier}deg)")

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