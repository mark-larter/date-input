/*!
 * DateInput jquery.ui plugin 
 *  - Date entry with validation, and optional popup datepicker UI. 
 *  - Popup datepicker UI provided by jQuery UI DatePicker plugin.
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
	// Set defaults.
	var pluginName = "dateInput";
	var	dateRegex = /^[\s\S]*$/;
	var	defaults = {
			showMessage: true,
			title: "Date",
			errorClass: "errorInput",
			dateFormat: "mm/dd/yy",
			messageFormat: "D M dd, yy",
			shortYearCutoff: "+20",
			minYear: "1900",
			maxYear: "2050",
			minDate: "01/01/1753",
			maxDate: "01/01/9999",
			hasPicker: true,
			hasButtons: false,
			isDateRequired: false,
			isEndDate: false,
			hasTime: false,
			isTimeRequired: false,
			hasSeconds: false
		};
	
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
			this.clearDate();
			var $element = $(this.element);
			var initialValue = $element.val();
			var options = this.options;
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
						jqInst.dateInput('setDateInternal', dateString);
					}
				});
			}

			$element.on('blur', function() {
				var jqInst = $(this);
				if (!options.hasPicker || !(jqInst.datepicker('widget').is(":focus"))) {
					var dateValue = jqInst.dateInput('setDateInternal', jqInst.val());
					if (dateValue.isValid) { jqInst.val(jqInst.dateInput('formatDate', dateValue.date)); }
				}
			});

			if (initialValue && initialValue !== "") { this.setDateInternal(initialValue); }
		},

		_showFeedback: function(dateValue) {
			var $element = $(this.element);
			if ($element && dateValue) {
				var options = this.options;
				if (this.getEnabled()) {
					if (options.showMessage) { $element.attr('title', dateValue.message); }
					if (dateValue.isValid) { $element.removeClass(options.errorClass); }
					else { $element.addClass(options.errorClass); }
				}
				else {
					if (options.showMessage) { $element.attr('title', ""); }
					$element.removeClass(options.errorClass);
				}
			}
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
				dateValue.message = options.title + " is required";
			}
			else if (dateString == null || dateString === "") {
				dateValue.isValid = true;
				dateValue.message = options.title + " is empty";                   
			}
			else {
				if (typeof dateString !== "string") { dateString = dateString.toString(); }
				var newDate = this._parseDate(dateString);
				if (!(dateString == null || dateString === ""))
				{			
					dateValue.date = newDate;
					if (isNaN(newDate)) { 
						dateValue.isValid = false;
						dateValue.message = options.title + " is invalid"; 
					}
					else {
						var minDate = options.minDate;
						var maxDate = options.maxDate;
						dateValue.isValid = (newDate >= this._parseDate(minDate) && newDate <= this._parseDate(maxDate));
						if (dateValue.isValid) { dateValue.message = $.datepicker.formatDate(options.messageFormat, newDate); }
						else {
							if (maxDate == defaults.maxDate) { dateValue.message = options.title + " must not be earlier than " + minDate; }
							else if (minDate == defaults.minDate) { dateValue.message = options.title + " must not be later than " + maxDate; }
							else { dateValue.message = options.title + " must be between " + minDate + " and " + maxDate; }
						}
					}
				}
			}
			
			return dateValue;
		},
	
		option: function(key, value) {
			if ($.isPlainObject(key)) {
				this.options = $.extend(true, this.options, key);
			}
			else if (key && (typeof value == "undefined")) {
				return this.options[key];
			}
			else {
				if (typeof key !== "string") { key = key.toString(); }
				if (key === "minDate" || key === "maxDate") {
					if (typeof value !== "string") { value = this.formatDate(value); }
					if (!value || value === "") {
						if (key === "minDate") { value = defaults.minDate; }
						else if (key === "maxDate") { value = defaults.maxDate; }
					}	
					if (this.options.hasPicker) {
						$element = $(this.element);
						var dateActive = $element.datepicker('getDate');
						$element.dateInput('clearDate');
						$element.datepicker('option', key, value);
						$element.dateInput('setDateInternal', dateActive);
						$element.val(this.formatDate(dateActive));
					}
				}
			
				this.options[key] = value;
			}
			
			return this;
		},

		setDateInternal: function(dateString) {
			if (typeof dateString !== "string") { dateString = this.formatDate(dateString); }
			this._dateValue = this._validateDate(dateString);
			var dateValue = this._dateValue;

			this._showFeedback(dateValue);
		   
			return dateValue;
		},

		setDate: function(dateInput) {
			var options = this.options;
			var hasPicker = options.hasPicker;
			var $element = $(this.element);
			var dateString = (typeof dateInput !== "string") ? this.formatDate(dateInput) : dateInput;
			if (dateString && dateString !== "") { 
				if (hasPicker) { $element.datepicker('setDate', dateString); }
				else { $element.val(dateString); }
				this.setDateInternal(dateString);
			}
			if (options.hasTime && this._timeElement) {
				var newDate = new Date(dateInput);
				if (!isNaN(newDate)) {
					var minutes = newDate.getMinutes();
					var timeString = newDate.getHours() + ":" + ((minutes < 10) ? "0" + minutes : minutes);
					if (options.hasSeconds) {
						var seconds = newDate.getSeconds();
						timeString = timeString + ":" + ((seconds < 10) ? "0" + seconds : seconds);
					}
					$(this._timeElement).timeInput('setTime', timeString);
				}
			}
		},

		clearDate: function() {
			this._dateValue = {
				isValid: false,
				message: null,
				date: null,
				timeValue: null
			};

			var $element = $(this.element);
			var options = this.options;
			if (options.hasTime && this._timeElement) { $(this._timeElement).timeInput('clearTime'); }
			if (options.hasPicker) { 
				$element.datepicker('setDate', null); 
				$element.datepicker('option', 'defaultDate', null); 
			}
			if (options.showMessage) { $element.attr('title', ""); }
			$element.removeClass(options.errorClass);
		},
		
		getDateValue: function() {
			// Incorporate time if appropriate.
			var options = this.options;
			var dateValue = this._validateDate(this.formatDate(this._dateValue.date));
			if (dateValue.isValid) {
				if (options.hasTime && this._timeElement) {
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
					this.setDateInternal(this.formatDate($element.datepicker('getDate')));
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
