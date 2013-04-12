/*!
 * DateInput jquery.ui plugin 
 *  - Date entry with validation, and optional popup datepicker UI. 
 *  - Popup datepicker UI provided by jquery.ui.datepicker.js plugin.
 *  - User input validated by regular expression.
 *
 * Author:      @marklarter - Mark Larter
 *
 * Copyright:   Copyright 2012-2013, Freeheel Group LLC, http://freeheelgroup.com.
 *
 * License:     MIT, GPL2
 * 
 * Depends:     jquery.core.js     
 *              jquery.ui.core.js
 *              jquery.ui.datepicker.js
 *
 * Notes:       Follows pattern guidance from "Essential jQuery Plugin Patterns" by Addy Osmani (et al),
 *              especially "Namespacing and Nested Namespacing" and "jQuery UI Widget Factory Bridge", at
 *              http://coding.smashingmagazine.com/2011/10/11/essential-jquery-plugin-patterns/
 */
 
// The semicolon before this function invocation protects against concatenated 
// scripts or other plugins that are not closed properly.
;(function($, window, document, undefined) {
	var pluginName = "dateInput",
        defaults = {
            showMessage: true,
            errorClass: "errorInput",
            dateDisplayFormat: "mm/dd/yy",
			fullDisplayFormat: "D M dd, yy",
            hasPicker: true,
            hasButtons: false,
            isDateRequired: false,
            hasTime: false,
            isTimeRequired: false,
            hasSeconds: false,
            onComplete: null
       },
		//dateRegex = /^((([0]?[1-9]|1[0-2])(:|\.)[0-5][0-9]((:|\.)[0-5][0-9])?( )?(AM|am|aM|Am|PM|pm|pM|Pm))|(([0]?[0-9]|1[0-9]|2[0-3])(:|\.)[0-5][0-9]((:|\.)[0-5][0-9])?))$/;
		dateRegex = /^[\s\S]*$/;
    
    // The plugin constructor.
    var dateInput = function(options, element) {
        this.options = $.extend({}, defaults, options || {});
        this.element = element;
        
        this._defaults = defaults;
        this._name = pluginName;
        
		this._dateRegex = dateRegex;
    
        this._init();
    }
    
    dateInput.prototype = {
        _create: function() {
            var self = this;
        },
        
        _init: function() {
            this._clearDate();
            var self = this, $element = $(this.element);
            var options = this.options;
            var onComplete = options.onComplete;
            if (options.hasPicker) {
                var hasButtons = options.hasButtons;
                $element.datepicker({
					changeMonth: true,
					changeYear: true,
					dateFormat: options.dateDisplayFormat,
                    showCloseButton: hasButtons,
                    showNowButton: hasButtons,
                    showDeselectButton: hasButtons && !options.isRequired,
                    onClose: function(date, inst) {
                        var jqInst = $(this);
                        jqInst.dateInput("setDate", date);
                        if (onComplete) { onComplete.apply(jqInst.dateInput, [self._dateValue]); }
                    }
                });
            }
            else {
                $element.on('blur', function(event) {
                    var jqInst = $(this);
                    jqInst.dateInput("setDate", jqInst.val());
                    if (onComplete) { onComplete.apply(jqInst.dateInput, [self._dateValue]); }
                });
            }
            
            var initialValue = $element.val();
            if (initialValue && initialValue !== "") { this.setDate(initialValue); }
        },
    
		option: function(key, value) {
            if ($.isPlainObject(key)) {
                this.options = $.extend(true, this.options, key);
            }
            else if (key && (typeof value == "undefined")) {
                return this.options[key];
            }
            else {
                this.options[key] = value;
            }
            
            return this;
		},

        _clearDate: function() {
            this._dateValue = {
                isValid: false,
                message: null,
                date: null,
                timeValue: null
            };
        },

		_showFeedback: function(dateValue) {
			var $element = $(this.element);
			if ($element && dateValue) {
				var options = this.options;
				if (options.showMessage) { $element.attr('title', dateValue.message); }
				if (dateValue.isValid) { $element.removeClass("errorInput"); }
				else { $element.addClass("errorInput"); }
			}
		},

        _validateDate: function(dateString) {
            var dateValue = {
                isValid: false,
                message: null,
                dateInput: null,
                date: null,
                timeValue: null
            };

            var options = this.options;
            if (options.isRequired && (dateString == null || dateString === "")) {
                dateValue.message = "Date is required";
            }
            else if (dateString == null || dateString === "") {
                dateValue.isValid = true;
                dateValue.message = "Date is empty";                   
            }
            else {
                // Now do actual date validation.
                if (typeof dateString !== "string") {
                    dateString = dateString.toString();
                }

				var newDate = new Date(dateString);
				dateValue.date = newDate;
                if (isNaN(newDate)) {
                    dateValue.message = "Date is invalid";
                }
                else { 
                    dateValue.isValid = true;
                    dateValue.message = $.datepicker.formatDate(options.fullDisplayFormat, newDate);
                }
            }

            // Show feedback.
            this._showFeedback(dateValue);

            return dateValue;
        },

        setDate: function(dateToSet) {
            this._dateValue = this._validateDate(dateToSet);

            var options = this.options;
            var hasPicker = options.hasPicker;
            var $element = $(this.element);
            if (dateToSet == null || dateToSet === "") {
                if (hasPicker) { $element.datepicker('setDate', ""); }
                else { $element.val(""); }
            }
            else {
                var dateValue = this._dateValue;
                if (dateValue.isValid) {
                    if (hasPicker) { $element.datepicker('setDate', dateValue.date); }
                    else { $element.val($.datepicker.formatDate(options.dateDisplayFormat, dateValue.date)); }
                }
            }
           
            return this;
        },

        clearDate: function() {
            this._clearDate();
        },
		
		addDays: function(days) {
			var intDays = parseInt(days, 10);
			if (intDays != NaN) {
				var adjustment = days + "d";
				if (intDays > 0) { adjustment = "+" + adjustment; }
				adjustment = "c" + adjustment;
				this.txtDate.datepicker("setDate", adjustment);
			}
		},
        
        getDateValue: function() {
            return this._dateValue;
        },

        setEnabled: function(isEnabled) {
            var hasTime = this.options.hasTime;
            if (isEnabled) {
                $(this.txtDate).removeAttr("disabled");
                if (hasTime)
                    $(_timeObject).removeAttr("disabled");
            }
            else {
                $(this.txtDate).attr("disabled", "disabled");
                if (hasTime)
                    $(_timeObject).attr("disabled", "disabled");
            }
        }
    };

	// Hook up to widget bridge.
	$.widget.bridge("dateInput", dateInput);
})(jQuery, window, document);
