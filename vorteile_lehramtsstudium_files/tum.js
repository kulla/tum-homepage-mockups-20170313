/**
 * This script is sourced in all pages
 */
	/** Utilities */
	TUM.lang = $('html').attr('lang');
	TUM.ll = function(dict){
		if (dict.hasOwnProperty(TUM.lang)) return dict[TUM.lang];
		for (var first in dict) return first;
	};
	TUM.resizeEls = [];
	$('.video-js-box').css({'width':'auto', 'height':'auto'});

	$('iframe[data-resizeme][width][height]').each(function(){
		$(this).css('maxWidth', '100%');
		TUM.resizeEls.push({el: $(this), w: parseInt($(this).attr('width')), h: parseInt($(this).attr('height'))});
	});

//(function() {
$(document).ready(function() {
	"use strict";

if (typeof $.fn.colorbox != 'function') $.fn.colorbox = function(x){return this;};

	/** Activate accordion function via H2 class */
	var els = $('h2.cordi').parent();
	if (els.length) {
		TUM.loadOnce.sexpand = '/fileadmin/tum/3rd/simpleexpand/simple-expand.min.js';
		els.each(function(){
			$(this).addClass('accordion');
			var all = $(this).children();
			var expandable = all.filter(':gt(0)');
			if (expandable.length) {
				expandable.wrapAll('<div class="expandable" />');
				all.first().addClass('expander').children('a').replaceWith(function(){return $(this).text();});
			}
		});
	}

	/** Streaming videos */
	if (TUM.video.length)
		TUM.loadOnce.streams = '/fileadmin/tum/streams.js';

	/** Image maps **/
	TUM.imagemaps = $('img[usemap]');
	if (TUM.imagemaps.length > 0)
		TUM.loadOnce.imagemaps = '/fileadmin/tum/3rd/jquery/jquery.rwdImageMaps.min.js';

	/** Load scripts requested by content elements (or above) */
	$.each(TUM.loadOnce, function(key, value){
		jQuery.ajax({
			url: value,
			dataType: 'script',
			cache: true
		}).done(function(){
			switch (key) {
			case 'sexpand':
				$('.expander').simpleexpand({'defaultTarget': '.expandable'});
				if (window.location.hash && window.location.hash.search(/^#c\d+$/) != -1) {
					$(window.location.hash + ' .expander').first().click();
					$(window).scrollTop($(window.location.hash).position().top);
				}
				break;
			case 'imagemaps':
				TUM.imagemaps.rwdImageMaps();
				break;
			}
		});
	});

	/** Arrange elements depending on display width */
	var fnArrange = function() {
		// Set menu state
		if (TUM.menutoggleMem != $('#menutoggle').css('display')) {
			TUM.menutoggleMem = $('#menutoggle').css('display');
			if (TUM.menutoggleMem == 'none') {
				// Wide: Hide user-expanded submenus, show navigation and current submenu,
				$('#sitenav').find('.inserted').hide();
				$('#sitenav').toggle(true);
				$('.audience').first().toggle(true);
				$('#currentsub').show();
			} else {
				// Narrow: Collapse navgation, restore user-expanded submenus
				$('#sitenav').toggle(false);
				$('.audience').first().toggle(false);
				$('#sitenav').find('.subx').each(function(){ if ($(this).data('state') == 2) $(this).next('ul').show(); });
			}
		}
		// Resize nasty elements
		if (TUM.resizeEls.length) {
			$.each(TUM.resizeEls, function(i, value) {
				value.el.height(value.el.width() / value.w * value.h);
			});
		}

		// Table "flexing"
		$('table.flex').each(function() {
			var wrapper = $(this).parent().get(0);
			if (wrapper.clientWidth <= $(this).data('flexpoint')) {
				$(this).addClass('flexing');
			} else {
				$(this).removeClass('flexing');
				if (wrapper.scrollWidth > wrapper.clientWidth)
					$(this).addClass('flexing').data('flexpoint', wrapper.clientWidth);
			}
		});

	};
	fnArrange();

	TUM.resizeTimer = null;
	$(window).resize(function() {
		if (!TUM.resizeTimer)
			TUM.resizeTimer = setTimeout(function() { TUM.resizeTimer = null; fnArrange(); }, 133); // Limit frequency (ms)
	});

	/** Activate menu toggling */
	$('#menutoggle').click(function(e) {
		e.preventDefault();
		$('.audience').first().slideToggle('slow');
		$('#sitenav').slideToggle('slow');
	});

	/** Activate search box */
	if (TUM.search.box == '1') {
		var parts = TUM.search.path.split('?');
		var form = $('<form/>')
			.attr('id', 'cse-box')
			.attr('action', parts[0])
			.append('<input type="text" id="cse-q" name="q" value="" />')
			.append('<button><img id="cse_sbblue" src="/fileadmin/tum/icons/search-white.png" alt="' + TUM.ll({de:'Suche', en:'Search'}) + '" /><img id="cse_sbgray" src="/fileadmin/tum/icons/search.png" alt="' + TUM.ll({de:'Suche', en:'Search'}) + '" /></button>')
			.append('<input type="hidden" name="sites" value="this" />')
		;
		if (parts.length > 1) {
			$.each(parts[1].split('&amp;'), function(i, value) {
				var kv = value.split('=');
				if (kv[0]=='id' && kv[1]) form.append($('<input type="hidden" name="id" value="' + decodeURI(kv[1]) + '"/>'));
				if (kv[0]=='L'  && kv[1] && kv[1]>0) form.append($('<input type="hidden" name="L" value="'  + decodeURI(kv[1]) + '"/>'));
			});
		}
		$('#cse-stub').first().replaceWith(form);
		$('#cse-q')
			.data('watermark', $('#cse-q').css('backgroundImage'))
			.blur(function(){ if ($(this).val().length == 0) $(this).css('backgroundImage', $(this).data('watermark')); })
			.focus(function(){ $(this).css('backgroundImage', 'none'); })
		;
	}

	/** Activate submenu expanders */
	$('#sitenav').find('li.sub > a').each(function expanders() {
		$(this)
			.after($('<ul class="inserted"></ul>').hide())
			.after($('<img class="subx" src="/fileadmin/tum/icons/mx_can.png" alt="+"/>').data('state', 0).click(function(){
				switch ($(this).data('state')) {
					case 0: // Not loaded (+): set "..", load, then expand, set "-"
						$(this).data('state', 1).attr({src:'/fileadmin/tum/icons/mx_wait.png', alt:'⋯'});
						var url = ($(this).prev().data('pid'))
							? TUM.hp + (TUM.hp.indexOf('?') === -1 ? '?' : '&') + 'pid=' + $(this).prev().data('pid')
							: $(this).prev().attr('href');
						url += (url.indexOf('?') === -1 ? '?' : '&') + 'type=5';
						$(this).next().load(url, function(){
							$(this).find('li.sub > a').each(expanders);
							$(this).slideDown();
							$(this).prev().data('state', 2).attr({src:'/fileadmin/tum/icons/mx_is.png', alt:'-'});
						});
						break;
					// case 1: Still loading, pass
					case 2: // Loaded and expanded (-): set "+", collapse,
						$(this).next().slideUp();
						$(this).data('state', 3).attr({src:'/fileadmin/tum/icons/mx_can.png', alt:'+'});
						break;
					case 3: // Loaded and collapsed (+): set "-", expand
						$(this).next().slideDown();
						$(this).data('state', 2).attr({src:'/fileadmin/tum/icons/mx_is.png', alt:'-'});
						break;
				}
			}))
		;
	});
	$('#sitenav').find('li.current.hassub > strong').first().each(function () {
		$(this)
			.after($('<img class="subx" src="/fileadmin/tum/icons/mx_is.png" alt="-"/></span>').data('state', 2).click(function (){
				switch ($(this).data('state')) {
					case 2: $(this).next().slideUp(); $(this).data('state', 3).attr({src:'/fileadmin/tum/icons/mx_can.png', alt:'+'}); break;
					case 3: $(this).next().slideDown(); $(this).data('state', 2).attr({src:'/fileadmin/tum/icons/mx_is.png', alt:'-'}); break;
				}
			}))
			.next().next().attr('id', 'currentsub')
		;
	});

	/** Activate popup links **/
	$('a.popup').on('click', function() {
		var newwindow = window.open(
			$(this).attr('href'),
			$(this).attr('target'),
			$(this).data('popts') + ',top=150,left=50,resizable=yes,scrollbars=yes,status=yes'
		);
		newwindow.focus();
		return false;
	});

	/** Prepare tables for "flexing" */
	$('table.flex').each(function() {
		var headers = [];
		$(this).find('thead th').each(function() { headers.push($(this).text()); });
		$(this).find('tbody tr').each(function() {
			$(this).find('th,td').each(function(index) {
				$(this).attr('data-label', (headers[index] ? headers[index] : '('+index+')'));
				if ($(this).text() == ' ') $(this).html('&nbsp;');
			});
		});
	});

//})();
});

$(window).load(function() {
	"use strict";

	/** Test for image loading */
	Modernizr.addTest('images', function() {
		var els = $('div.tum img');
		return (els.eq(0).prop('naturalWidth') == undefined || els.eq(0).prop('naturalWidth') == 73 || els.eq(1).prop('naturalWidth') == 73);
	});

	/** Pre-load hover images */
	$.each(['', '-download', '-ext', '-lock', '-mail'], function(i, v) { $('<img src="/fileadmin/tum/icons/link'+v+'-a.svg"/>'); });

	/** For file links, layout 3: Attach lightbox to preview images */
	var els = $('.csc-uploads-3');
	if (els.length) {
		els.find('img').colorbox(jQuery.extend(
			{},
			{
				href: function(){return $(this).attr('src');},
				maxHeight: '98%',
				rel: function(){return $(this).attr('rel');},
				title: function(){return($(this).parent().attr('title') ? $(this).parent().attr('title') : '') + ' [<a class="download" href="' + $(this).parent().attr('href') + '">Download</a>]';}
			},
			TUM.ll({
				de:{
					html: function(){return $(this).attr('width') == '0' ? '<div class="nopreview">Keine Vorschau verfügbar</div>' : false;},
					current: 'Vorschau {current} von {total}',
					previous: 'voriges',
					next: 'n&auml;chstes',
					close: 'schliessen'
				},
				en:{
					html: function(){return $(this).attr('width') == '0' ? '<div class="nopreview">No preview available</div>' : false;},
					current: 'Preview {current} of {total}',
					previous: 'previous',
					next: 'next',
					close: 'close'
				}
			})
		));
	}

	/** Fit colorbox titles */
	$(document).bind('cbox_complete', function(){
		$('#cboxTitle')
			.wrapInner('<div id="cboxTitleInner"></div>')
			.css({'font-size':'inherit', 'line-height':'1.2'});
		var h = $('#cboxTitle').height();
		while (h > 45) {
			$('#cboxTitle').css('font-size', '-=1');
			h = $('#cboxTitle').height();
		}
		$('#cboxTitle').css('bottom', (23 - h) +'px');
	});

	/** Enhancements for print */
	var fnBeforePrint = function() {
		if ($('body').hasClass('printextras'))
			return true;
		$('body').removeClass('no-printextras').addClass('printextras');

		var base = window.location.protocol + '//' + window.location.host;

		// Link URLs as footnotes
		var urllist = [];
		var i = 0;
		$('#content a, #sidebar a').not($('#cse a')).each(function() {
			var ref = $(this).attr('href');
			if (ref.substr(0, 1) != '#') {
				if (ref.substr(0, 1) == '/')
					ref = base + ref;
				i = $.inArray(ref, urllist);
				if (i == -1) {
					urllist.push(ref);
					$(this).after('<sup class="print-inline urlindex">['+urllist.length+']</sup>');
				} else {
					$(this).after('<sup class="print-inline urlindex">['+(i+1)+']</sup>');
				}
			}
		});
		var list = $('<ol class="print-block urllist"></ol>');
		for (i = 0; i < urllist.length; i++) {
			list.append($('<li>' + urllist[i] + '</li>'));
		}

		// Short URL, QR code, date
		var surl = base + '/?' + TUM.pid;
		if (TUM.lid) surl += '&L='+TUM.lid;
		var now = new Date();
		var info = $('<p id="pfooter" class="print-block small">'
			+ '<img id="qrimage" src="/fileadmin/tum/opt/qr?s='+encodeURIComponent(base+'/?'+TUM.pid)+'" />'
			+ TUM.ll({de:'Kurz-URL: ', en:'Short URL: '}) + surl
			+ '<br/>' + TUM.ll({de:'Datum: ', en:'Date: '}) + now.getFullYear() + '-' + (now.getMonth()+1) + '-' + now.getDate()
			+ '</p>'
		);

		$('#page-body').after(list, info);
	};

	if (Modernizr.matchmedia) {
		var mqlist = window.matchMedia('print');
		mqlist.addListener(function(mql) { if (mql.matches) fnBeforePrint(); });
	}
	window.onbeforeprint = fnBeforePrint;

});
