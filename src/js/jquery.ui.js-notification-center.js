/**
 * Created with JetBrains PhpStorm.
 * User: dkreuer
 * Date: 03.11.12
 * Time: 11:00
 * To change this template use File | Settings | File Templates.
 */

(function($) {
    $.widget("ui.jsNotificationCenter", {
        options: {
            position: "right",   // either "left" or "right"
            speed: 250           // speed of slide-animation in milliseconds
        },

        _create: function() {
            var $body = $("body"),
                viewport = $("<div/>").addClass("jsnotificationcenter-viewport");
            this._sliding = false;
            this._enabled = true;
            this._groupList = {};
            $(this.element).addClass("jnotificationcenter-container");
            $body.children().not("script").not(".jsnotification-container").each(function(){
                $(this).appendTo(viewport);
            });
            viewport.appendTo($body);
            $(this.element).appendTo($body);
            this.__createMarkup();
            this._trigger("ready");
        },

        __createMarkup: function() {
            var self = this,
                $body = $("body"),
                $notificationContainer = $("<div class=\"jnotificationcenter-notificationcontainer\"/>"),
                $modal = $("<div/>");
            if (this.options.position === "left") {
                $(this.element).addClass("position-left");
            } else {
                $(this.element).addClass("position-right");
            }
            $("<span class=\"jnotificationcenter-action-settings\"></span>").appendTo($(this.element));
            $notificationContainer.addClass("position-top-right");
            $notificationContainer.appendTo($body);
            $modal.addClass("jnotificationcenter-modal")
                .hide()
                .click(function() {
                    self.close();
                })
                .appendTo($body);
        },

        _init: function() {

        },

        _destroy: function() {

        },

        refresh: function() {

        },

        toggle: function() {
            if ($(this.element).is(":visible")) {
                this.close();
            } else {
                this.open();
            }
        },

        open: function() {
            if (this._trigger("beforeopen") === false) {
                return;
            }
            var self = this,
                $me = $(this.element),
                slideWidth = $me.outerWidth( true ),
                bodyAnimateIn = {},
                slideAnimateIn = {},
                $body = $(".jsnotificationcenter-viewport"),
                $notificationContainer = $(".jnotificationcenter-notificationcontainer");

            if (!this._enabled || $me.is(":visible") || self._sliding) {
                return;
            }
            self._sliding = true;

            if (this.options.position === "left") {
                $me.css({left:"-" + slideWidth + "px", right:"auto"});
                bodyAnimateIn["margin-left"] = "+=" + slideWidth;
                bodyAnimateIn["margin-right"] = "-=" + slideWidth;
                slideAnimateIn.left = "+=" + slideWidth;
            } else {
                $me.css({left:"auto", right:"-" + slideWidth + "px"});
                bodyAnimateIn["margin-left"] = "-=" + slideWidth;
                bodyAnimateIn["margin-right"] = "+=" + slideWidth;
                slideAnimateIn.right = "+=" + slideWidth;
            }

            // Animate the slide, and attach this slide's settings to the element
            $(".jnotificationcenter-modal").show();
            $body.animate(bodyAnimateIn, self.options.speed);
            $notificationContainer.animate(slideAnimateIn, self.options.speed);
            $me.show()
                .animate(slideAnimateIn, self.options.speed, function() {
                    self._sliding = false;
                });
            this._trigger("open");
        },

        close: function() {
            if (this._trigger("beforeclose") === false) {
                return;
            }
            var self = this,
                $me = $(this.element),
                slideWidth = $me.outerWidth( true),
                bodyAnimateIn = {},
                slideAnimateIn = {},
                $body = $(".jsnotificationcenter-viewport"),
                $notificationContainer = $(".jnotificationcenter-notificationcontainer");

            if (!this._enabled || $me.is(":hidden") || self._sliding) {
                return;
            }
            self._sliding = true;

            if (this.options.position === "left") {
                bodyAnimateIn["margin-left"] = "-=" + slideWidth;
                bodyAnimateIn["margin-right"] = "+=" + slideWidth;
                slideAnimateIn.left = "-=" + slideWidth;
            } else {
                bodyAnimateIn["margin-left"] = "+=" + slideWidth;
                bodyAnimateIn["margin-right"] = "-=" + slideWidth;
                slideAnimateIn.right = "-=" + slideWidth;
            }

            $(".jnotificationcenter-modal").hide();
            $me.animate(slideAnimateIn, this.options.speed);
            $notificationContainer.animate(slideAnimateIn, self.options.speed);
            $body.animate(bodyAnimateIn, this.options.speed, function() {
                $me.hide();
                self._sliding = false;
            });
            this._trigger("close");
        },

        addNotification: function(groupid, title, message, icon, notificationTime, timeout) {
            if (!this._enabled) {
                return;
            }

            if (typeof timeout === "undefined" || timeout === null) {
                timeout = 5000;
            }
            if (typeof notificationTime === "undefined" || notificationTime === null) {
                notificationTime = new Date();
            }
            if (typeof icon === "undefined") {
                icon = null;
            }

            var self = this,
                $notification = $("<div class=\"jnotificationcenter-notification\"/>"),
                $msg = $("<div class=\"jnotificationcenter-message\"/>").appendTo($notification);
            $msg.html("<p class=\"message-heading\">" + title + "</p><p>" + message + "</p>");

            $notification.data("time", notificationTime);
            $notification.data("group-id", groupid);
            $notification.prependTo($(".jnotificationcenter-notificationcontainer"));
            $notification
                .fadeIn({duration: 200, queue: false})
                .css("display", "none")
                .slideDown(200)
                .delay(timeout)
                .fadeOut(200, function(){
                    self.__moveNotificationToCenter($notification);
                    $notification.remove();
                });
        },

        addNotificationGroup: function(groupid, title, icon) {
            this._groupList[groupid] = {
                title: title,
                icon: (typeof icon === "undefined") ? null : icon
            };
        },

        __moveNotificationToCenter: function ($notification) {
            if (typeof this._groupList[$notification.data("group-id")] === "undefined") {
                // group does not exist, drop notification
                return;
            }
            var groupId = $notification.data("group-id"),
                groupData = this._groupList[groupId],
                $group = $(".jnotificationcenter-container div.jnotificationcenter-container-group.g" + groupId),
                $notificationList,
                $item;
            if (!$group.length) {
                $group = $("<div/>").prependTo($(".jnotificationcenter-container"))
                    .addClass("jnotificationcenter-container-group")
                    .addClass("g" + groupId);
                $group.append($("<span/>").text(groupData.title));
                $group.append($("<ul/>"));
            }
            $notificationList = $("ul", $group);

            $item = $("<li/>");
            $($notification.children()).not("img").each(function(){
                $(this).appendTo($item);
            });
            $item.prependTo($notificationList);
        },

        _setOption: function(option, value) {
            switch (option) {
                case "disabled":
                    if (value && $(this.element).is(":visible")) {
                        this.close();
                    }
                    this._enabled = !value;
                    return;

                case "position":
                    if (this.options.position === "left") {
                        $(this.element).addClass("position-left")
                            .removeClass("position-right");
                    } else {
                        $(this.element).addClass("position-right")
                            .removeClass("position-left");
                    }
                    break;
            }
            this._super( "_setOption", option, value );
        }
    });
})(jQuery);
