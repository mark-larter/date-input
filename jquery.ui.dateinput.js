﻿/*!
 * DateInput jquery.ui plugin 
 *  - Date entry with validation, and optional popup datepicker UI. 
 *  - Popup datepicker UI provided by jquery.ui.datepicker.js plugin.
 *  - User input validated by regular expression, then by sugarjs.
 *
 * Author:      @marklarter - Mark Larter
 *
 * Copyright:   Copyright 2012-2013, Freeheel Group LLC, http://freeheelgroup.com.
 *
 * License:     MIT, GPL2
 * 
 * Depends:     jquery.core.js     
 *              jquery.ui.core.js,
 *              jquery.ui.datepicker.js
 *              sugar.js - http://sugarjs.com
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
            "showError": true,
            "errorClass": "errorInput",
            "hasPicker": true,
            "hasButtons": false
            "isRequired": false
        },
		//dateRegex = /^((([0]?[1-9]|1[0-2])(:|\.)[0-5][0-9]((:|\.)[0-5][0-9])?( )?(AM|am|aM|Am|PM|pm|pM|Pm))|(([0]?[0-9]|1[0-9]|2[0-3])(:|\.)[0-5][0-9]((:|\.)[0-5][0-9])?))$/;
		dateRegex = /^[\s\S]*$/;
    
    // The plugin constructor.
    var dateInput = function(options, element) {
        this.options = $.extend({}, defaults, options || {});
        this.element = element;
        
        this._defaults = defaults;
        this._name = pluginName;
        
        // Test for the presence of the Microsoft Ajax library. This is necessary due to conflicting Date.format implementations between
        // the Microsoft Ajax library and the sugarjs library. This must wait until the constructor, rather than in global plugin definition,
        // because the plugin instance's environment is what must be tested.
        var isMsAjax = (typeof Sys !== "undefined");

        this._dateDisplayFormat = isMsAjax ? "yyyy/MM/dd" : "{yyyy}/{MM}/{dd}";
        this._fullDisplayFormat = isMsAjax ? "W MMM dd, yyyy" : "{Weekday} {Month} {ord}, {year}";
		this._dateRegex = dateRegex;
    
		this._dateValue = {
			isValid: false,
			message: null,
			date: null
		};
			
        this._init();
    }
    
    dateInput.prototype = {
        _create: function() {
        },
        
		_init: function() {
            var options = this.options;
			if (options.hasPicker) {
				var hasButtons = options.hasButtons;
				$(this.element).datepicker({
					showCloseButton: hasButtons,
					showNowButton: hasButtons,
					showDeselectButton: hasButtons && !options.isRequired,
					onClose: function (date, inst) {
						$(this).dateInput("setDate", date);
					}
				});
			}
			else {
				$(this.element).on('blur', function(event) {
					$(this).dateInput("setDate", $(this).val());
				});
			}
           
            var initialValue = $(this.element).val();
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
		
		_validateDate: function(dateString) {
			var dateValue = {
				isValid: false,
				message: null,
				date: null
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
                var matches = dateString.match(this._dateRegex);                        
                if (matches) {
                    dateValue.isValid = true;
                    var dateInput = Date.create(dateString);
                    dateValue.date = dateInput;
                    dateValue.message = dateInput.format(this._fullDisplayFormat);
                }
                else {
                    dateValue.message = "Date is invalid";                   
                }
            }

            if (options.showError) {
                var elInput = $(this.element);
                if (dateValue.isValid) {
                    elInput.removeClass(options.errorClass);
                    elInput.attr('title', "");
                }
                else {
                    elInput.addClass(options.errorClass);
                    elInput.attr('title', dateValue.message);
                }
            }
				
			return dateValue;       
		},

        setDate: function(dateToSet) {
			this._dateValue = this._validateDate(dateToSet);

            var hasPicker = this.options.hasPicker;
			if (dateToSet === "") {
				if (hasPicker) { $(this.element).datepicker('setDate', dateToSet); }
				else { $(this.element).val(""); }
			}
			else {
                var dateValue = this._dateValue;
				if (dateValue.isValid) {
                    var formattedDate = dateValue.date.format(this._dateDisplayFormat);
					if (hasPicker) { $(this.element).datepicker('setDate', formattedDate); }
					else { $(this.element).val(formattedTime); }
				}
			}
            
            return this;
        },
        
        getDateValue: function() {
            return this._dateValue;
        }
    };

	// Hook up to widget bridge.
	$.widget.bridge("dateInput", dateInput);
})(jQuery, window, document);
    
    
    
function DateTimeControlObject(dateControlID, timeControlId, minYear, allowBlankDate, isEndDate) {
    this.AllowBlankDate = allowBlankDate;
    this.IsEndDate = isEndDate;
    this.ChkIsValid = $("#" + dateControlID + "_isvalid");

    intYear = parseInt(minYear, 10);
    if (intYear == NaN) { minYear = "1930"; }
    else {
        if (intYear < 1930) { minYear = "1930"; }
        else if (intYear > 2025) { minYear = "2025"; }
    }

    this.txtDate = $("#" + dateControlID);
    var currentSetDate = new Date(this.txtDate.val());
    this.txtDate.datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: "mm/dd/yy",
        yearRange: minYear + ":2025",
        onClose: function (dateString, inst) {
            _validateDate(dateString);
        },
        onSelect: function (dateString, inst) {
            var newDateTime = new Date(dateString);
            $(inst).datepicker("setDate", newDateTime);
        }
    });

    if (!(isNaN(currentSetDate))) {
        this.txtDate.datepicker("setDate", currentSetDate);
    }

    this.SetDate = function (expression) {
        var dateValue = new Date(expression);
        this.txtDate.datepicker("setDate", dateValue);
    }

    this.GetDate = function () {
        return new Date(this.txtDate.val());
    }

    this.val = function () {
        if (arguments.length == 1) {
            this.SetDate(dateValue);
        } 
        else {
            this.GetDate();
        }
    }

    this.AddDays = function (days) {
        var intDays = parseInt(days, 10);
        if (intDays != NaN) {
            var adjustment = days + "d";
            if (intDays > 0) {
                adjustment = "+" + adjustment;
            }
            adjustment = "c" + adjustment;
            this.txtDate.datepicker("setDate", adjustment);
        }
    }

    this.GetIsValid = _validateDate;

    this.SetEnabled = function (isEnabled) {
        if (isEnabled) {
            $(this.txtDate).removeAttr("disabled");
        }
        else {
            $(this.txtDate).attr("disabled", "disabled");
        }
    }

    this.GetEnabled = function () {
        if ($(this.txtDate).attr("disabled"))
            return false;
        else
            return true;
    }
}
