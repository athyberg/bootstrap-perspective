/**
The MIT License (MIT)

Copyright (c) 2016 Anders Thyberg (anders.thyberg@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

(function($) {

  var Perspective = function() {

    // don't do anything if no perspective found 
    if ($('.perspective').length === 0) {
      return;
    } 

    var $tabSlots, $ctxMenu;
    var dis = this;
    $(window).on('resize', function() {
      $('dd').each(function() {
        dis.viewResize($(this));
      });        
    });

    this.layout();
  };

  Perspective.prototype.layout = function() {  
    // adding 'single-content' to single slots
    $('.slot-single > dd').prepend('<div class="content single-content">');
    $('.slot-single > dd > .single-content').each(function() {
      $(this).append($(this).siblings('.view:first'));
    });
    
    // adding 'nav-tabs' and 'tab-content' to tab slots
    $('.slot-tab > dd').each(function() {
      var views = $(this).children();
      if (views.length === 1) views.addClass('active');
    }); 
    $('.slot-tab > dd').prepend('<ul class="nav nav-tabs">');
    $('.slot-tab > dd > .view').each(function() {
      $(this).asTab($(this).siblings('.nav-tabs'));
    });
    $('.slot-tab > dd > ul.nav.nav-tabs').after('<div class="content tab-content">');
    $('.slot-tab > dd > .tab-content').each(function() {
      $(this).append($(this).siblings('.view'));
    });

    // tab-collapse
    $('.slot-tab > dd > ul.nav.nav-tabs')
      .prepend('<li class="dropdown dropdown-tabs hide pull-right"><a class="dropdown-toggle" data-toggle="dropdown" href="#">' + 
               '<b class="caret"></b></a><ul class="dropdown-menu"></ul></li>');

    // tab fade transitions
    $('.slot-tab[fade]').find('.view').addClass('fade');
    $('.slot-tab[fade]').find('.view.active').addClass('in');

    // adding 'tray-content' to tray slots
    $('.slot-tray > dd').prepend('<div class="content tray-content">');
    $('.slot-tray > dd > .tray-content').each(function() {
      $(this).append($(this).siblings('.view'));
    });

    // adding slot ids
    var $slotCnt = 1000;
    $('.slot:not(.slot-split)').each(function() {
      $(this).attr('id', 'slot-' + $slotCnt++);
    });

    // adding the context menu
    $('<div class="contextmenu"></div>').appendTo('body');

    // adding 'draghandles' (slot-split)
    $('.slot-split:not(.fixed) .slot:not(:first-child) > dd').after('<dt class="draghandle">');
    $('.draghandle').draggable();

    var hStart = this.handleDragStart, 
        hDrag =  this.handleDragging, 
        hStop =  this.handleDragStop;

    $('.slot-split-horizontal > dd > .slot > .draghandle').each(function(idx, element) {
      var p = $(element).parents('.slot-split-horizontal');
      $(element).draggable({
        axis: 'x',
        containment: p,
        start: hStart,
        drag:  hDrag,
        stop:  hStop
      });
    });

    $('.slot-split-vertical > dd > .slot > .draghandle').each(function(idx, element) {
      var p = $(element).parents('.slot-split-vertical');
      $(element).draggable({
        axis: 'y',
        containment: p,
        start: hStart,
        drag:  hDrag,
        stop:  hStop
      });
    });

    $tabSlots = $('.slot-tab');
    $ctxMenu = $('.contextmenu');

    // make tab containers droppable and sortable
    $tabSlots.find('.nav-tabs').droppable({
      drop: function(event, ui) {
        var view = $(ui.draggable).find('.view');
        var slotContent = $(this).siblings('.content');
        view.addClass('active');
        $(this).find('li').removeClass('active');
        slotContent.children('.view').removeClass('active');
        slotContent.children('.view').removeClass('in');

        view.asTab($(this));

        slotContent.append(view);
        view.trigger('tab-attach', [ slotContent ]);

        $tabSlots.filter('.over[fade]').find('.view').addClass('fade');
        $tabSlots.filter('.over[fade]').find('.view.active').addClass('in');
        $(ui.draggable).remove();
      },
      tolerance: 'pointer',
      accept: '.dialog',
      activeClass: 'accepting',
      hoverClass: 'accepting-hover'
    })
    .sortable({
      delay: 500,
      axis: 'x',
      stop: function( event, ui ) {
        $(ui.item).css('top', '');
        $(ui.item).css('left', '');
      }
    });

    setInterval(function() {
      $('.view').each(function() {
        $('[href="#' + $(this).attr('id') + '"]').text($(this).attr('name'));
      });
    }, 1000);
  };

  Perspective.prototype.viewResize = function (dd) {
    // move tabs to dropdown if they don't fit in tab bar  
    var navTabs = dd.children('.nav-tabs');
    navTabs.children('li.dropdown-tabs').first().removeClass('hide');
    var dropdownTabs = navTabs.find('li.dropdown-tabs .dropdown-menu').first();
    navTabs.append(dropdownTabs.children());
    navTabs.children('li:not(.dropdown-tabs)').each(function() {
      if (this.offsetTop > 15) {
        dropdownTabs.append(this);
      }
    });
    if (dropdownTabs.find('.active').length > 0) {
      navTabs.children('li.dropdown-tabs').first().addClass('active');
    }
    else {
      navTabs.children('li.dropdown-tabs').first().removeClass('active');
    }
    if (dropdownTabs.children().length === 0) {
      navTabs.children('li.dropdown-tabs').first().addClass('hide');
    }

    // trigger 'view-resize' event (remove tab height if slot-tab)
    var tabHeight = navTabs.first().outerHeight() || 0;
    dd.find('.view').trigger('view-resize', [ dd.outerHeight() - tabHeight, dd.outerWidth() ]);
  };


  // -------------------------------------------------------------------
  // HANDLE SLOT SPLIT DRAG AND RESIZE
  // -------------------------------------------------------------------

  var dragStartX, dragStartY;

  Perspective.prototype.handleDragStart = function ( event, ui ) {
    dragStartX = parseInt( ui.offset.left );
    dragStartY = parseInt( ui.offset.top );  
  };

  Perspective.prototype.handleDragging = function ( event, ui) {
    // nothing yet  
  };

  Perspective.prototype.handleDragStop = function ( event, ui ) {
    var parent_dd = $(ui.helper).parent().parent(); 
    var slots_dl = parent_dd.children('.slot'); 
    var slot_resizing = slots_dl.has($(ui.helper));
    var slot_following = slot_resizing.prev();
    var vertical = (parseInt( ui.offset.left ) - dragStartX === 0);
    var f, r, uiOfs, parentOfs, uiHelperOuter, parentOuter;

    if (vertical) {
      uiHelperOuter = ui.helper.outerHeight();
      parentOuter = parent_dd.outerHeight();
      uiOfs = ui.offset.top;
      parentOfs = parent_dd.offset().top;
    }
    else {
      uiHelperOuter = ui.helper.outerWidth();
      parentOuter = parent_dd.outerWidth();
      uiOfs = ui.offset.left;
      parentOfs = parent_dd.offset().left;
    }

    var totalPrev = 0;
    var totalNext = 0;
    slots_dl.each(function() {
      var slot = $(this), slotOuter;
      if (vertical) {
        slotOuter = slot.outerHeight();
      }
      else {
        slotOuter = slot.outerWidth();
      }

      if (!slot.is(slot_resizing) && !slot.is(slot_following) && slot.nextAll().is(slot_following)) {
        totalPrev += slotOuter;
      }
      else if (!slot.is(slot_resizing) && !slot.is(slot_following)) {
        totalNext += slotOuter;
      }
      slot.css('flex-basis', slotOuter);
    });

    f = parseInt( uiOfs ) - parentOfs + uiHelperOuter/2 - totalPrev;
    r = parentOuter - f - totalPrev - totalNext;
      
    $(ui.helper).css('top', '');
    $(ui.helper).css('left', '');
    slot_resizing.css('flex-basis', r);
    slot_following.css('flex-basis', f);

    parent_dd.find('.slot:not(.slot-split) dd').each(function() { 
      $perspective.viewResize($(this)); 
    });

    setTimeout(function() {
      var json = { layout: [] };
      $('.slot[id][style*="flex"]').each(function() {
        json.layout.push({ id: $(this).attr('id'), style: $(this).attr('style') });
      });
      $('.perspective').trigger('layout-change', [json]);
    }, 100);
  };

  // -------------------------------------------------------------------
  // UTILS / PLUGINS
  // -------------------------------------------------------------------

  $.fn.appendView = function() {
    $(this).appendTo('body');
    this.focus();
  };

  var $dialogCnt = 1000;
  $.fn.dialog = function(top, left) {
    var view = $(this);
    var panel = $(
      '<div id="dialog-"' + $dialogCnt + '" class="dialog" tabindex="-1" role="dialog"><div class="panel-dialog">' +
      '<div class="panel panel-default"></div></div></div>');
    var heading = $(
      '<div class="panel-heading">' +
      '<button type="button" class="close" data-dismiss="dialog" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
      '<h4 class="dialog-title" href="#' + view.attr('id') + '">' + view.attr('name') + '</h4></div>');
    var body = $('<div class="panel-body">').append(view);
    panel.find('.panel').append(heading).append(body);

    // close (default function for dialog)
    heading.find('.close').on('mousedown', function() {
      view.trigger('dialog-close', [ panel ]);
    });
    
    // focus
    panel.on('mousedown', function() {
      panel.appendView();
    });
    
    panel.draggable({
      start: function() {
        panel.appendView();
      },
      opacity: 0.75,
      handle: '.panel-heading',
      containment: $('.perspective')
    });

    $dialogCnt++;
    
    view.trigger('view-resize', [ view.height() ]);

    return panel;
  };

  $.fn.showView = function(top, left) {
    var dialog = $(this);

    dialog.css('top', 0);
    dialog.css('left', -9999);
    dialog.appendView();
    
    var wh = $(window).height();
    var height = dialog.height() * 100 / wh;
    if (height > 100) {
      height = wh * 0.85;
      dialog.css('height', height);
    }

    dialog.css('top', top || ($(window).height() - dialog.height()) / 2);
    dialog.css('left', left || ($(window).width() - dialog.width()) / 2);
    dialog.addClass('raised');
  };

  $.fn.asTab = function(tabContainer) {
    var view = $(this);
    var $active = view.hasClass('active') ? 'active' : '',
        $viewId = view.attr('id'),
        $viewTitle = view.attr('name');

    var detached = false;
    var tab = $('<li class="' + $active + '"><a data-toggle="tab" href="#' + $viewId + '">' + $viewTitle + '</a></li>');
    $(tabContainer).append(tab);
    view.addClass('tab-pane');

    tab.on('shown.bs.tab', function (event) {
      view.trigger('view-active', [ tab ]);
    });
    
    tab.on('contextmenu', function(event) {
      // no context menus on mobile devices
      if (typeof window.orientation !== 'undefined') {
        return;
      }
      event.preventDefault();
      var c = $('<button type="button" class="btn btn-danger btn-lg" aria-label="Close"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>');
      var d = $('<button type="button" class="btn btn-default btn-lg" aria-label="Detach"><span class="glyphicon glyphicon-new-window" aria-hidden="true"></span></button>');
      $ctxMenu.children().remove();
      $ctxMenu.append(d).append(c);
      $ctxMenu.css({ top: event.pageY + 'px', left: event.pageX + 'px', display: 'inline-block' }).appendView();

      // NOTE! It is up to the 'view' to decide what should happen to the tab when it is closed or detached
      c.on('click', function(event) {
        view.trigger('tab-close', [ tab, event.pageY, event.pageX ]);
      })  ;
      d.on('click', function(event) {
        view.trigger('tab-detach', [ tab, event.pageY, event.pageX ]);
      });
      $(document).on('click', function(event) {
        $ctxMenu.css({ display: 'none' });
        $ctxMenu.children().remove();
      });
    });
  };

  var $perspective = new Perspective();

}) (window.jQuery);
