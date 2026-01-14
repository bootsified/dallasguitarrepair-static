/*
 * Example usage:
 * $(elem).animate( {top: 100}, $.easie(0.25,0.1,0.25,1.0) );
 */
 
/*
 * jquery.easie.js:
 * http://www.github.com/jaukia/easie
 *
 * Version history:
 * 1.0.1 Semver versioning for jQuery plugins repository
 * 1.0.0 Initial public version
 *
 * LICENCE INFORMATION:
 *
 * Copyright (c) 2011 Janne Aukia (janne.aukia.com),
 * Louis-Rémi Babé (public@lrbabe.com).
 *
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL Version 2 (GPL-LICENSE.txt) licenses.
 *
 * LICENCE INFORMATION FOR DERIVED FUNCTIONS:
 *
 * Function cubicBezierAtTime is written by Christian Effenberger, 
 * and corresponds 1:1 to the WebKit project function.
 * "WebCore and JavaScriptCore are available under the 
 * Lesser GNU Public License. WebKit is available under 
 * a BSD-style license."
 *
 */

/*jslint sub: true */

(function($) {
    "use strict";

    var prefix = "easie",
        ease = "Ease",
        easeIn = prefix+ease+"In",
        easeOut = prefix+ease+"Out",
        easeInOut = prefix+ease+"InOut",
        names = ["Quad","Cubic","Quart","Quint","Sine","Expo","Circ"];

    $.easie = function(p1x,p1y,p2x,p2y,name,forceUpdate) {
        name = name || [prefix,p1x,p1y,p2x,p2y].join("-");
        if ( !$.easing[name] || forceUpdate ) {
            // around 40x faster with lookup than without it in FF4
            var cubicBezierAtTimeLookup = makeLookup(function(p) {
                // the duration is set to 5.0. this defines the precision of the bezier calculation.
                // the animation is ok for durations up to 5 secs with this.
                // with the lookup table, the precision can be high without any big penalty.
                return cubicBezierAtTime(p,p1x,p1y,p2x,p2y,5.0);
            });
    
            $.easing[name] = function(p, n, firstNum, diff) {
                return cubicBezierAtTimeLookup.call(null, p);
            }
            $.easing[name].params = [p1x,p1y,p2x,p2y];
        }
        return name;
    }

    var $easie = $.easie;

    // default css3 easings

    $easie(0.000, 0.000, 1.000, 1.000, prefix+"Linear");
    $easie(0.250, 0.100, 0.250, 1.000, prefix+ease);
    $easie(0.420, 0.000, 1.000, 1.000, easeIn);
    $easie(0.000, 0.000, 0.580, 1.000, easeOut);
    $easie(0.420, 0.000, 0.580, 1.000, easeInOut);

    // approximated Penner equations, from:
    // http://matthewlein.com/ceaser/
    
    $easie(0.550, 0.085, 0.680, 0.530, easeIn+names[0]);
    $easie(0.550, 0.055, 0.675, 0.190, easeIn+names[1]);
    $easie(0.895, 0.030, 0.685, 0.220, easeIn+names[2]);
    $easie(0.755, 0.050, 0.855, 0.060, easeIn+names[3]);
    $easie(0.470, 0.000, 0.745, 0.715, easeIn+names[4]);
    $easie(0.950, 0.050, 0.795, 0.035, easeIn+names[5]);
    $easie(0.600, 0.040, 0.980, 0.335, easeIn+names[6]);
                    
    $easie(0.250, 0.460, 0.450, 0.940, easeOut+names[0]);
    $easie(0.215, 0.610, 0.355, 1.000, easeOut+names[1]);
    $easie(0.165, 0.840, 0.440, 1.000, easeOut+names[2]);
    $easie(0.230, 1.000, 0.320, 1.000, easeOut+names[3]);
    $easie(0.390, 0.575, 0.565, 1.000, easeOut+names[4]);
    $easie(0.190, 1.000, 0.220, 1.000, easeOut+names[5]);
    $easie(0.075, 0.820, 0.165, 1.000, easeOut+names[6]);
                    
    $easie(0.455, 0.030, 0.515, 0.955, easeInOut+names[0]);
    $easie(0.645, 0.045, 0.355, 1.000, easeInOut+names[1]);
    $easie(0.770, 0.000, 0.175, 1.000, easeInOut+names[2]);
    $easie(0.860, 0.000, 0.070, 1.000, easeInOut+names[3]);
    $easie(0.445, 0.050, 0.550, 0.950, easeInOut+names[4]);
    $easie(1.000, 0.000, 0.000, 1.000, easeInOut+names[5]);
    $easie(0.785, 0.135, 0.150, 0.860, easeInOut+names[6]);

    function makeLookup(func,steps) {
        var i;
        steps = steps || 101;
        var lookupTable = [];
        for(i=0;i<(steps+1);i++) {
            lookupTable[i] = func.call(null,i/steps);
        }
        return function(p) {
            if(p===1) return lookupTable[steps];
            var sp = steps*p;
            // fast flooring, see
            // http://stackoverflow.com/questions/2526682/why-is-javascripts-math-floor-the-slowest-way-to-calculate-floor-in-javascript
            var p0 = Math.floor(sp);
            var y1 = lookupTable[p0];
            var y2 = lookupTable[p0+1];
            return y1+(y2-y1)*(sp-p0);
        }
    }

    // From: http://www.netzgesta.de/dev/cubic-bezier-timing-function.html
    // 1:1 conversion to js from webkit source files
    // UnitBezier.h, WebCore_animation_AnimationBase.cpp
    function cubicBezierAtTime(t,p1x,p1y,p2x,p2y,duration) {
        var ax=0,bx=0,cx=0,ay=0,by=0,cy=0;
        // `ax t^3 + bx t^2 + cx t' expanded using Horner's rule.
        function sampleCurveX(t) {return ((ax*t+bx)*t+cx)*t;}
        function sampleCurveY(t) {return ((ay*t+by)*t+cy)*t;}
        function sampleCurveDerivativeX(t) {return (3.0*ax*t+2.0*bx)*t+cx;}
        // The epsilon value to pass given that the animation is going to run over |dur| seconds. The longer the
        // animation, the more precision is needed in the timing function result to avoid ugly discontinuities.
        function solveEpsilon(duration) {return 1.0/(200.0*duration);}
        function solve(x,epsilon) {return sampleCurveY(solveCurveX(x,epsilon));}
        // Given an x value, find a parametric value it came from.
        function solveCurveX(x,epsilon) {var t0,t1,t2,x2,d2,i;
            function fabs(n) {if(n>=0) {return n;}else {return 0-n;}}
            // First try a few iterations of Newton's method -- normally very fast.
            for(t2=x, i=0; i<8; i++) {x2=sampleCurveX(t2)-x; if(fabs(x2)<epsilon) {return t2;} d2=sampleCurveDerivativeX(t2); if(fabs(d2)<1e-6) {break;} t2=t2-x2/d2;}
            // Fall back to the bisection method for reliability.
            t0=0.0; t1=1.0; t2=x; if(t2<t0) {return t0;} if(t2>t1) {return t1;}
            while(t0<t1) {x2=sampleCurveX(t2); if(fabs(x2-x)<epsilon) {return t2;} if(x>x2) {t0=t2;}else {t1=t2;} t2=(t1-t0)*0.5+t0;}
            return t2; // Failure.
        }
        // Calculate the polynomial coefficients, implicit first and last control points are (0,0) and (1,1).
        cx=3.0*p1x; bx=3.0*(p2x-p1x)-cx; ax=1.0-cx-bx; cy=3.0*p1y; by=3.0*(p2y-p1y)-cy; ay=1.0-cy-by;
        // Convert from input time to parametric value in curve, then from that to output time.
        return solve(t, solveEpsilon(duration));
    }

})(jQuery);
!function(a,b,c,d){"use strict";function e(b,c){this.element=b;var d={};a.each(a(this.element).data(),function(a,b){var c=function(a){return a&&a[0].toLowerCase()+a.slice(1)},e=c(a.replace("fluidbox",""));(""!==e||null!==e)&&(b="false"==b?!1:!0,d[e]=b)}),this.settings=a.extend({},h,c,d),this.settings.viewportFill=Math.max(Math.min(parseFloat(this.settings.viewportFill),1),0),this.settings.stackIndex<this.settings.stackIndexDelta&&(settings.stackIndexDelta=settings.stackIndex),this._name=g,this.init()}var f=a(b),g=(a(c),"fluidbox"),h={immediateOpen:!1,loader:!1,maxWidth:0,maxHeight:0,resizeThrottle:500,stackIndex:1e3,stackIndexDelta:10,viewportFill:.95},i={},j=0;("undefined"==typeof console||"undefined"===console.warn)&&(console={},console.warn=function(){}),a.isFunction(a.throttle)||console.warn("Fluidbox: The jQuery debounce/throttle plugin is not found/loaded. Even though Fluidbox works without it, the window resize event will fire extremely rapidly in browsers, resulting in significant degradation in performance upon viewport resize.");var k=function(){var a,b=c.createElement("fakeelement"),e={transition:"transitionend",OTransition:"oTransitionEnd",MozTransition:"transitionend",WebkitTransition:"webkitTransitionEnd"};for(a in e)if(b.style[a]!==d)return e[a]},l=k(),m={dom:function(){var b=a("<div />",{"class":"fluidbox__wrap",css:{zIndex:this.settings.stackIndex-this.settings.stackIndexDelta}});if(a(this.element).addClass("fluidbox--closed").wrapInner(b).find("img").first().css({opacity:1}).addClass("fluidbox__thumb").after('<div class="fluidbox__ghost" />'),this.settings.loader){var c=a("<div />",{"class":"fluidbox__loader",css:{zIndex:2}});a(this.element).find(".fluidbox__wrap").append(c)}},prepareFb:function(){var b=this,c=a(this.element);c.trigger("thumbloaddone.fluidbox"),m.measure.fbElements.call(this),b.bindEvents(),c.addClass("fluidbox--ready"),b.bindListeners(),c.trigger("ready.fluidbox")},measure:{viewport:function(){i.viewport={w:f.width(),h:f.height()}},fbElements:function(){var b=this,c=a(this.element),d=c.find("img").first(),e=c.find(".fluidbox__ghost"),f=c.find(".fluidbox__wrap");b.instanceData.thumb={natW:d[0].naturalWidth,natH:d[0].naturalHeight,w:d.width(),h:d.height()},e.css({width:d.width(),height:d.height(),top:d.offset().top-f.offset().top+parseInt(d.css("borderTopWidth"))+parseInt(d.css("paddingTop")),left:d.offset().left-f.offset().left+parseInt(d.css("borderLeftWidth"))+parseInt(d.css("paddingLeft"))})}},checkURL:function(a){var b=0;return/[\s+]/g.test(a)?(console.warn("Fluidbox: Fluidbox opening is halted because it has detected characters in your URL string that need to be properly encoded/escaped. Whitespace(s) have to be escaped manually. See RFC3986 documentation."),b=1):/[\"\'\(\)]/g.test(a)&&(console.warn("Fluidbox: Fluidbox opening will proceed, but it has detected characters in your URL string that need to be properly encoded/escaped. These will be escaped for you. See RFC3986 documentation."),b=0),b},formatURL:function(a){return a.replace(/"/g,"%22").replace(/'/g,"%27").replace(/\(/g,"%28").replace(/\)/g,"%29")}};a.extend(e.prototype,{init:function(){var b=this,c=a(this.element),d=c.find("img").first();if(m.measure.viewport(),(!b.instanceData||!b.instanceData.initialized)&&c.is("a")&&1===c.children().length&&(c.children().is("img")||c.children().is("picture")&&1===c.find("img").length)&&"none"!==c.css("display")&&"none"!==c.children().css("display")&&"none"!==c.parents().css("display")){c.removeClass("fluidbox--destroyed"),b.instanceData={},b.instanceData.initialized=!0,b.instanceData.originalNode=c.html(),j+=1,b.instanceData.id=j,c.addClass("fluidbox__instance-"+j),c.addClass("fluidbox--initialized"),m.dom.call(b),c.trigger("init.fluidbox");var e=new Image;d.width()>0&&d.height()>0?m.prepareFb.call(b):(e.onload=function(){m.prepareFb.call(b)},e.onerror=function(){c.trigger("thumbloadfail.fluidbox")},e.src=d.attr("src"))}},open:function(){var b=this,c=a(this.element),d=c.find("img").first(),e=c.find(".fluidbox__ghost"),f=c.find(".fluidbox__wrap");b.instanceData.state=1,e.off(l),a(".fluidbox--opened").fluidbox("close");var g=a("<div />",{"class":"fluidbox__overlay",css:{zIndex:-1}});if(f.append(g),c.removeClass("fluidbox--closed").addClass("fluidbox--loading"),m.checkURL(d.attr("src")))return b.close(),!1;e.css({"background-image":"url("+m.formatURL(d.attr("src"))+")",opacity:1}),m.measure.fbElements.call(b);var h;b.settings.immediateOpen?(c.addClass("fluidbox--opened fluidbox--loaded").find(".fluidbox__wrap").css({zIndex:b.settings.stackIndex+b.settings.stackIndexDelta}),c.trigger("openstart.fluidbox"),b.compute(),d.css({opacity:0}),a(".fluidbox__overlay").css({opacity:1}),e.one(l,function(){c.trigger("openend.fluidbox")}),h=new Image,h.onload=function(){if(1===b.instanceData.state){if(b.instanceData.thumb.natW=h.naturalWidth,b.instanceData.thumb.natH=h.naturalHeight,c.removeClass("fluidbox--loading"),m.checkURL(h.src))return b.close(),!1;e.css({"background-image":"url("+m.formatURL(h.src)+")"}),b.compute()}},h.onerror=function(){b.close(),c.trigger("imageloadfail.fluidbox"),c.trigger("delayedloadfail.fluidbox")},h.src=c.attr("href")):(h=new Image,h.onload=function(){return c.removeClass("fluidbox--loading").addClass("fluidbox--opened fluidbox--loaded").find(".fluidbox__wrap").css({zIndex:b.settings.stackIndex+b.settings.stackIndexDelta}),c.trigger("openstart.fluidbox"),m.checkURL(h.src)?(b.close(),!1):(e.css({"background-image":"url("+m.formatURL(h.src)+")"}),b.instanceData.thumb.natW=h.naturalWidth,b.instanceData.thumb.natH=h.naturalHeight,b.compute(),d.css({opacity:0}),a(".fluidbox__overlay").css({opacity:1}),void e.one(l,function(){c.trigger("openend.fluidbox")}))},h.onerror=function(){b.close(),c.trigger("imageloadfail.fluidbox")},h.src=c.attr("href"))},compute:function(){var b=this,c=a(this.element),d=c.find("img").first(),e=c.find(".fluidbox__ghost"),g=c.find(".fluidbox__wrap"),h=b.instanceData.thumb.natW,j=b.instanceData.thumb.natH,k=b.instanceData.thumb.w,l=b.instanceData.thumb.h,m=h/j,n=i.viewport.w/i.viewport.h;b.settings.maxWidth>0?(h=b.settings.maxWidth,j=h/m):b.settings.maxHeight>0&&(j=b.settings.maxHeight,h=j*m);var o,p,q,r,s;n>m?(o=j<i.viewport.h?j:i.viewport.h*b.settings.viewportFill,q=o/l,r=h*(l*q/j)/k,s=q):(p=h<i.viewport.w?h:i.viewport.w*b.settings.viewportFill,r=p/k,q=j*(k*r/h)/l,s=r),b.settings.maxWidth&&b.settings.maxHeight&&console.warn("Fluidbox: Both maxHeight and maxWidth are specified. You can only specify one. If both are specified, only the maxWidth property will be respected. This will not generate any error, but may cause unexpected sizing behavior.");var t=f.scrollTop()-d.offset().top+.5*(l*(s-1))+.5*(f.height()-l*s),u=.5*(k*(s-1))+.5*(f.width()-k*s)-d.offset().left,v=parseInt(100*r)/100+","+parseInt(100*q)/100;e.css({transform:"translate("+parseInt(100*u)/100+"px,"+parseInt(100*t)/100+"px) scale("+v+")",top:d.offset().top-g.offset().top,left:d.offset().left-g.offset().left}),c.find(".fluidbox__loader").css({transform:"translate("+parseInt(100*u)/100+"px,"+parseInt(100*t)/100+"px) scale("+v+")"}),c.trigger("computeend.fluidbox")},recompute:function(){this.compute()},close:function(){var b=this,c=a(this.element),e=c.find("img").first(),f=c.find(".fluidbox__ghost"),g=c.find(".fluidbox__wrap"),h=c.find(".fluidbox__overlay");return null===b.instanceData.state||typeof b.instanceData.state==typeof d||0===b.instanceData.state?!1:(b.instanceData.state=0,c.trigger("closestart.fluidbox"),c.removeClass(function(a,b){return(b.match(/(^|\s)fluidbox--(opened|loaded|loading)+/g)||[]).join(" ")}).addClass("fluidbox--closed"),f.css({transform:"translate(0,0) scale(1,1)",top:e.offset().top-g.offset().top+parseInt(e.css("borderTopWidth"))+parseInt(e.css("paddingTop")),left:e.offset().left-g.offset().left+parseInt(e.css("borderLeftWidth"))+parseInt(e.css("paddingLeft"))}),c.find(".fluidbox__loader").css({transform:"none"}),f.one(l,function(){f.css({opacity:0}),e.css({opacity:1}),h.remove(),g.css({zIndex:b.settings.stackIndex-b.settings.stackIndexDelta}),c.trigger("closeend.fluidbox")}),void h.css({opacity:0}))},bindEvents:function(){var b=this,c=a(this.element);c.on("click.fluidbox",function(a){a.preventDefault(),b.instanceData.state&&0!==b.instanceData.state?b.close():b.open()})},bindListeners:function(){var b=this,c=a(this.element),d=function(){m.measure.viewport(),m.measure.fbElements.call(b),c.hasClass("fluidbox--opened")&&b.compute()};a.isFunction(a.throttle)?f.on("resize.fluidbox"+b.instanceData.id,a.throttle(b.settings.resizeThrottle,d)):f.on("resize.fluidbox"+b.instanceData.id,d),c.on("reposition.fluidbox",function(){b.reposition()}),c.on("recompute.fluidbox, compute.fluidbox",function(){b.compute()}),c.on("destroy.fluidbox",function(){b.destroy()}),c.on("close.fluidbox",function(){b.close()})},unbind:function(){a(this.element).off("click.fluidbox reposition.fluidbox recompute.fluidbox compute.fluidbox destroy.fluidbox close.fluidbox"),f.off("resize.fluidbox"+this.instanceData.id)},reposition:function(){m.measure.fbElements.call(this)},destroy:function(){var b=this.instanceData.originalNode;this.unbind(),a.data(this.element,"plugin_"+g,null),a(this.element).removeClass(function(a,b){return(b.match(/(^|\s)fluidbox[--|__]\S+/g)||[]).join(" ")}).empty().html(b).addClass("fluidbox--destroyed").trigger("destroyed.fluidbox")},getMetadata:function(){return this.instanceData}}),a.fn[g]=function(b){var c=arguments;if(b===d||"object"==typeof b)return this.each(function(){a.data(this,"plugin_"+g)||a.data(this,"plugin_"+g,new e(this,b))});if("string"==typeof b&&"_"!==b[0]&&"init"!==b){var f;return this.each(function(){var d=a.data(this,"plugin_"+g);d instanceof e&&"function"==typeof d[b]?f=d[b].apply(d,Array.prototype.slice.call(c,1)):console.warn('Fluidbox: The method "'+b+'" used is not defined in Fluidbox. Please make sure you are calling the correct public method.')}),f!==d?f:this}return this}}(jQuery,window,document);
var Konami = {

    /*
    *--------------------------------------------------------
    * KONAMI, BITCHES!!! FTW
    *--------------------------------------------------------
    */
    init: function() {
        var user_keys = [],
            konami = '38,38,40,40,37,39,37,39,66,65';
        document.onkeydown = function(e){
            user_keys.push(e.keyCode);
            if (user_keys.toString().indexOf(konami) >= 0) {
                alert('UNLOCKED! You are now invincible. (cheater!)');
                user_keys = [];
            }
        }
    }

};




// Requires jQuery, and the Easie jQuery plugin
// `bower install jquery.easie.js --save-dev`

var ScrollToAnchor = {

    init: function() {
        sta_s = this.settings;
        this.bindUIActions();
    },

    bindUIActions: function() {
        $('.scroll').click(function(e) {
            var target_id,
                // pad = $('#header-main').innerHeight(),
                pad = 0,
                attr = $(this).attr('href');

            // if ($(window).width() < 980) {
            //     pad = $('.branding').outerHeight();
            // } else {
            //     pad = $('#nav-main').outerHeight();
            // }

            if (typeof attr !== typeof undefined && attr !== false) {
                target_id = attr;
            } else {
                target_id = $('a', this).attr('href');
            }

            ScrollToAnchor.scrollPage(target_id, pad);

            $('html').removeClass('menu-open');
            e.preventDefault();
        });
    },

    scrollPage: function(trgt, offset) {
        if (typeof offset === 'undefined') {
            offset = 0;
        }

        var target_offset,
            target_array,
            target_top,
            pad,
            dest,
            doc_h = $(document).height(),
            win_h = $(window).height(),
            avail_scroll = doc_h - win_h;

        if (trgt === "#top" || trgt === "#") {
            target_top = 0;
            offset = 0;
        } else {
            target_array = trgt.split('#');
            target_offset = $('#' + target_array[1]).offset();
            target_top = target_offset.top;
        }

        pad = offset;
        // pad = 20;
        dest = target_top - pad;

        if (dest > avail_scroll) {
            dest = avail_scroll;
        }

        $('html, body').stop().animate({scrollTop:dest}, 750, 'easieEaseInOutCubic');
    }

};
// Requires jQuery, and the Fluidbox plugin
// https://github.com/terrymun/Fluidbox

var Galleries = {

    init: function() {
        this.bindUIActions();
    },

    bindUIActions: function() {
        $('.lightbox').fluidbox();
    }

};
/*

$$$$$$$\   $$$$$$\   $$$$$$\ $$$$$$$$\  $$$$$$\
$$  __$$\ $$  __$$\ $$  __$$\\__$$  __|$$  __$$\
$$ |  $$ |$$ /  $$ |$$ /  $$ |  $$ |   $$ /  \__|
$$$$$$$\ |$$ |  $$ |$$ |  $$ |  $$ |   \$$$$$$\
$$  __$$\ $$ |  $$ |$$ |  $$ |  $$ |    \____$$\
$$ |  $$ |$$ |  $$ |$$ |  $$ |  $$ |   $$\   $$ |
$$$$$$$  | $$$$$$  | $$$$$$  |  $$ |   \$$$$$$  |
\_______/  \______/  \______/   \__|    \______/


 DALLAS GUITAR REPAIR - 2016
 ....................................................................
 www.dallasguitarrepair.com

 designed/developed by Boots
 www.boots.media

*/

// Protect global namespace
(function() {

    // Setup 'onReady' listener
    var domReady = function(callback) {
    	if (document.readyState === "interactive" || document.readyState === "complete") {
    		callback();
    	} else {
    		document.addEventListener("DOMContentLoaded", callback);
    	}
    };


    /*
    *--------------------------------------------------------
    * ON DOCUMENT READY
    *--------------------------------------------------------
    */
    domReady(function() {

        Konami.init();
        ScrollToAnchor.init();
        Galleries.init();

        $('.btn-more').click(function(e) {
            e.preventDefault();
            $(this).hide().parent().next('.hide').removeClass('hide');
        });

    }); // END ON DOCUMENT READY

})();