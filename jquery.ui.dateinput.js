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
            dateFormat: "mm/dd/yy",
			messageFormat: "D M dd, yy",
			shortYearCutoff: "+20",
			minYear: "1900",
			maxYear: "2050",
			minDate: "01/01/1753",
			maxDate: "12/31/9999",
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

		if (this.options.hasTime) {
			var timeElementId = $(this.element).attr('id') + "_ctrlTime";
			this._timeElement = $("#" + timeElementId);
		}
		else { this._timeElement = null; }
    
        this._init();
		
		return this;
    }
    
    dateInput.prototype = {
        _create: function() {
        },
        
        _init: function() {
            this._clearDate();
            var $element = $(this.element);
			var initialValue = $element.val();
            var options = this.options;
            var onComplete = options.onComplete;
            if (options.hasPicker) {
                var hasButtons = options.hasButtons;
                $element.datepicker({
					defaultDate: initialValue,
					changeMonth: true,
					changeYear: true,
					yearRange: options.minYear + ":" + options.maxYear,
					minDate: options.minDate,
					maxDate: options.maxDate,
					dateFormat: options.dateFormat,
					shortYearCutoff: options.shortYearCutoff,
                    showCloseButton: hasButtons,
                    showNowButton: hasButtons,
                    showDeselectButton: hasButtons && !options.isDateRequired,
					onClose: function(dateString, inst) {
						var jqInst = $(this);
						jqInst.dateInput('setDate', dateString);
                    }
                });
            }
 
			$element.on('blur', function(event) {
				var jqInst = $(this);
				if (!options.hasPicker || !(jqInst.datepicker('widget').is(":focus"))) {
					var dateValue = jqInst.dateInput('setDate', jqInst.val());
					if (dateValue.isValid) { jqInst.val(jqInst.dateInput('formatDate', dateValue.date)); }
					if (onComplete) { onComplete.apply(jqInst.dateInput, [dateValue]); }
				}
			});
			
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

		_showFeedback: function(dateValue) {
			var $element = $(this.element);
			if ($element && dateValue) {
				var options = this.options;
				if (options.showMessage) { $element.attr('title', dateValue.message); }
				if (dateValue.isValid) { $element.removeClass(options.errorClass); }
				else { $element.addClass(options.errorClass); }
			}
		},

        _clearDate: function() {
            this._dateValue = {
                isValid: false,
                message: null,
                date: null,
                timeValue: null
            };
			if (this.options.hasTime && this._timeElement) { $(this._timeElement).timeInput('clearTime'); }
       },
		
		_parseDate: function(dateString) {
            var options = this.options;
			var newDate = null;
			try { 
				newDate = $.datepicker.parseDate(options.dateFormat, dateString, { shortYearCutoff: options.shortYearCutoff });
			}
			catch (ex) {
				newDate = new Date(NaN);
			}
			
			return newDate;
		},
		
		_validateDate: function(dateString) {
			var options = this.options;
			var dateValue = {
				isValid: false,
				message: null,
				dateInput: null,
				date: null,
				timeValue: null
			};

			if (options.isDateRequired && (dateString == null || dateString === "")) {
				dateValue.message = "Date is required";
			}
			else if (dateString == null || dateString === "") {
				dateValue.isValid = true;
				dateValue.message = "Date is empty";                   
			}
			else {
				if (typeof dateString !== "string") { dateString = dateString.toString(); }
				var newDate = this._parseDate(dateString);
				if (!(dateString == null || dateString === ""))
				{			
					dateValue.date = newDate;
					if (isNaN(newDate)) { 
						dateValue.isValid = false;
						dateValue.message = "Date is invalid"; 
					}
					else {
						var minDate = options.minDate;
						var maxDate = options.maxDate;
						dateValue.isValid = (newDate >= this._parseDate(minDate) && newDate <= this._parseDate(maxDate));
						if (dateValue.isValid) { dateValue.message = $.datepicker.formatDate(options.messageFormat, newDate); }
						else {
							if (maxDate == defaults.maxDate) { dateValue.message = "Date must not be earlier than " + minDate; }
							else if (minDate == defaults.minDate) { dateValue.message = "Date must not be later than " + maxDate; }
							else { dateValue.message = "Date must be between " + minDate + " and " + maxDate; }
						}
					}
				}
			}
			
			return dateValue;
		},

        setDate: function(dateString) {
            this._dateValue = this._validateDate(dateString);
            var dateValue = this._dateValue;

            var options = this.options;
            var hasPicker = options.hasPicker;
            var $element = $(this.element);
			
            this._showFeedback(dateValue);
           
            return dateValue;
        },

		clearDate: function() {
			this._clearDate();
			var dateValue = this._dateValue;
			$(this.element).datepicker('setDate', null);
		},
		
		getDateValue: function() {
			// Incorporate time if appropriate.
			var dateValue = this._validateDate(this.formatDate(this._dateValue.date));
			if (dateValue.isValid) {
				if (this.options.hasTime && this._timeElement) {
					var timeValue = $(this._timeElement).timeInput('getTimeValue');
					dateValue.timeValue = timeValue;
					if (timeValue.isValid) {
						dateValue.date.setHours(timeValue.hours);
						dateValue.date.setMinutes(timeValue.minutes);
						var seconds = timeValue.seconds;
						if (seconds) { dateValue.date.setSeconds(seconds); }
					}
				}
			}

			return dateValue;
		},

		getDate: function() {
			return this.getDateValue().date;
		},

		getIsValid: function() {
			return this.getDateValue().isValid;
		},

		getEnabled: function () {
			var $element = $(this.element);
			return (!($element.attr("disabled")))
		},

		setEnabled: function(isEnabled) {
			var $element = $(this.element);
			var hasTime = this.options.hasTime;
			if (isEnabled) {
				$element.removeAttr("disabled");
				if (hasTime)
					$(this._timeElement).removeAttr("disabled");
			}
			else {
				$element.attr("disabled", "disabled");
				if (hasTime)
					$(this._timeElement).attr("disabled", "disabled");
			}
		},
		
		addDays: function(days) {
			var intDays = parseInt(days, 10);
			if (intDays != NaN) {
				var adjustment = days + "d";
				if (intDays > 0) { adjustment = "+" + adjustment; }
				adjustment = "c" + adjustment;
				if (this.options.hasPicker) {
					var $element = $(this.element);
					$element.datepicker('setDate', adjustment);
					this._dateValue = this._setDate(this.formatDate($element.datepicker('getDate')));
				}
			}
		},
 		
		formatDate: function(date) {
            var options = this.options;
			return $.datepicker.formatDate(options.dateFormat, date);
		}
   };

	// Hook up to widget bridge.
	$.widget.bridge("dateInput", dateInput);
})(jQuery, window, document);
