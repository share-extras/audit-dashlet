/**
 * Copyright (C) 2010-2011 Alfresco Share Extras project
 *
 * This file is part of the Alfresco Share Extras project.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * You should have received a copy of the Apache 2.0 license along with
 * this project. If not, see <http://www.apache.org/licenses/LICENSE-2.0>.
 */

/**
 * Dashboard Audit entries viewing component
 *
 * @author Romain Guinot
 * @namespace Alfresco
 * @class Alfresco.dashlet.AuditApplication
 */
(function()
{
    /**
    * YUI Library aliases
    */
    var Dom = YAHOO.util.Dom,
      Event = YAHOO.util.Event;

    /**
    * Alfresco Slingshot aliases
    */
    var $html = Alfresco.util.encodeHTML,
      $combine = Alfresco.util.combinePaths;

    /**
    * Dashboard AuditApplication constructor.
    *
    * @param {String} htmlId The HTML id of the parent element
    * @return {Alfresco.dashlet.AuditApplication} The new component instance
    * @constructor
    */
    Alfresco.dashlet.AuditApplication = function AuditApplication_constructor(htmlId)
    {
      return Alfresco.dashlet.AuditApplication.superclass.constructor.call(this, "Alfresco.dashlet.AuditApplication", htmlId, ["datatable", "datasource", "paginator", "autocomplete"]);
   };

    /**
    * Extend from Alfresco.component.Base and add class implementation
    */
    YAHOO.extend(Alfresco.dashlet.AuditApplication, Alfresco.component.Base,
    {
	/**
	* Object container for initialization options
	*
	* @property options
	* @type object
	*/
	options:
	{
	    /**
	    * The component id.
	    *
	    * @property componentId
	    * @type string
	    */
	    componentId: "",

	    /**
	    * The application to display entries for
	    *
	    * @property application
	    * @type string
	    * @default ""
	    */
	    application: "",

	    /**
	    * If set only display entries entirely matching the audit value  (not a partial substring match)
	    *
	    * @property valueFilter
	    * @type string
	    * @default ""
	    */
	    valueFilter: "",

	    /**
	    * If set only display as many matching entries. The audit API limits the results to 100 by default
	    *
	    * @property valueFilter
	    * @type string
	    * @default ""
	    */
	    limit: "",

	    /**
	    * Number of entries to display per page
	    *
	    * @property rowsPerPage
	    * @type int
	    * @default 10
	    */
	    defaultRowsPerPage: 10,

	    /**
	    * Number of entries to display per page
	    *
	    * @property rowsPerPage
	    * @type int
	    * @default defaultRowsPerPage
	    */
	    rowsPerPage: "",

	    /**
	    * Additional audit API server side query params
	    *
	    * @property additionalQueryParams
	    * @type string
	    * @default ""
	    */
	    additionalQueryParams: "",

	    /**
	    * Whether or not to show the ID column
	    *
	    * @property show_id_column
	    * @type string
	    * @default ""
	    */
	    show_id_column: "",

	    /**
	    * Whether or not to show the user column
	    *
	    * @property show_user_column
	    * @type string
	    * @default ""
	    */
	    show_user_column: "",

	    /**
	    * Whether or not to show the time column
	    *
	    * @property show_time_column
	    * @type string
	    * @default ""
	    */
	    show_time_column: "",

	    /**
	    * Whether or not to show the values column
	    *
	    * @property show_values_column
	    * @type string
	    * @default ""
	    */
	    show_values_column: ""

	},

	/**
	* Body div object
	* 
	* @property bodyContainer
	* @type object
	* @default null
	*/
	bodyContainer: null,

	/**
	* entries datatable div object
	* 
	* @property entriesContainer
	* @type object
	* @default null
	*/
	entriesContainer: null,

	/**
	* timeout between two refresh between keyup events in the filter search box
	*/
	consecutiveRefreshMinimumDelay : 300,

	/**
	* Search box related div objects
	* 
	* @property searchBoxContainer
	* @type object
	* @default null
	*/
	searchBoxContainer: null,
	searchBoxLabelContainer: null,

	/**
	* Message div object
	* 
	* @property messageContainer
	* @type object
	* @default null
	*/
	messageContainer: null,

	/**
	* Title div object
	* 
	* @property titleContainer
	* @type object
	* @default null
	*/
	titleContainer: null,

	/**
	* Datatable object
	* 
	* @property dataTable
	* @type object
	* @default null
	*/
	dataTable: null,

	/**
	* Datasource object
	* 
	* @property dataSource
	* @type object
	* @default null
	*/
	dataSource: null,



      /**
       * Fired by YUI when parent element is available for scripting
       * 
       * @method onReady
       */
	onReady: function AuditApplication_onReady()
	{
	    this.titleContainer = Dom.get(this.id + "-title");
	    this.bodyContainer = Dom.get(this.id + "-body");
	    this.entriesContainer = Dom.get(this.id + "-entries");
	    this.messageContainer = Dom.get(this.id + "-message");
	    this.searchBoxContainer = Dom.get(this.id + "-searchWithinResultsFilter");
	    this.searchBoxLabelContainer = Dom.get(this.id + "-searchWithinResultsFilterLabel");

	    if(YAHOO.env.ua.webkit > 0)
	    	Dom.removeClass(this.entriesContainer,"scrollableList");

	    Event.addListener(this.id + "-configure-link", "click", this.onConfigClick, this, true);
	    Event.addListener(this.id + "-refresh", "click", this.onRefresh, this, true);

	    Event.addListener(this.searchBoxContainer,"keyup", this.onSearchWithinResultsFilterKeyup, this, true);

	    this.init();
	},

      /**
       * Initialise the display of the dashlet
       * 
       * @method init
       */
	init: function AuditApplication_init()
	{
	    // reset search box on init
	    this.searchBoxLabelContainer.innerHTML = this.msg("audit.dashlet.searchWithinResults", 0) +" :";
	    this.searchBoxContainer.value = "";
	    Dom.removeClass(this.searchBoxContainer,'invalid-regex'); 
	    Dom.removeClass(this.searchBoxContainer,'valid-regex');

	    // push utility prototypes to String
	    this.addUtilPrototypes();

	    // Set the title according to selected options (args)
	    if (this.options.application != "")
	    {
		var appHeader = this.options.application;
		var vfHeader  = this.options.valueFilter ? " " + this.msg("audit.dashlet.valuefilteredOn") + " " + this.options.valueFilter : "";
		// valid limit parameter values : strictly positive integers. other values are ignored
		var validLimit = this.options.limit != "" && !isNaN(this.options.limit) && !((this.options.limit * 1) < 1 );
		var limitHeader = validLimit ? " ("+ this.options.limit + " max)" : "";

		this.titleContainer.innerHTML = this.msg("audit.dashlet.header.default")+ " : " + appHeader + vfHeader + limitHeader;

		// an application name has been configured, display the search box
		Dom.removeClass(this.searchBoxContainer,'shy');
		Dom.removeClass(this.searchBoxLabelContainer,'shy');

	    }
	    else
	    {
		this.titleContainer.innerHTML = this.msg("audit.dashlet.header.default");

		// don't display the search box if no application name has been configured
		Dom.addClass(this.searchBoxContainer,'shy');
		Dom.addClass(this.searchBoxLabelContainer,'shy');
	    }


	    // Load the data
	    if (this.dataTable)
	    {
		this.dataTable.destroy(); // nulls the table contents
		this.dataTable = null;    // explicitely null out the table itself
	    }

	    if (this.options.application != "")
	    {
		this.setMessage(); // a 'not configured' msg may be present. reset to blank since there is now a configured app. 
		this.loadData();
	    }
	    else
		this.setMessage(this.msg("audit.dashlet.notConfigured"));
	},

      /**
       * Set a message text to display to the user
       * 
       * @method setMessage
       * @param msg {string} Message text to set
       */
	setMessage: function AuditApplication_setMessage(msgText)
	{
	    if (msgText)
	    {
		this.messageContainer.innerHTML = msgText;
		Dom.setStyle(this.messageContainer, "display", "block");
	    }
	    else
	    {
		this.messageContainer.innerHTML = "";
		Dom.setStyle(this.messageContainer, "display", "none");
	    }
	},

	/**
	 * Add utility prototypes to String, so that they can be used easily throughout 
	 * @method addUtilPrototypes
	 */
	addUtilPrototypes: function AuditApplication_addUtilPrototypes()
	{
	    // use unassignable/non-characters unicode codepoints as markers. see unicode.org/charts/PDF/uFFF0.pdf.
	    // These characters have been reserved for in-process usage by the unicode chart, and are guaranteed to not map 
	    // to an actual character, in any alphabet.Therefore they won't need to be escaped throughout the string.
	    // prefix : an optional prefix before the span
	    String.prototype.swapHighlightMarkers = function(prefix)
	    {
		return this.replace(/\uFFFE/g, (prefix ? prefix : "") + "<span class='regex-highlight'>").replace(/\uFFFF/g,"</span>");
	    };

	    // remove markers and replace with an optional replacement 
	    String.prototype.trimHighlightMarkers = function(replacement)
	    {
		return this.replace(/[\uFFFE\uFFFF]/g, replacement ? replacement : "");
	    };

	    //treat metacharacters in the text as literal since there may be dots in an audit value that would be in a filename for example
	    String.prototype.sanitizeforHighlighting = function(text)
	    {
		var metacharacters="$()*+.?[\^{|";
		return this.replace(/([\$\(\)\*\+\.\?\[\\\^\{\|])/g,function($0)
		{
		    return "\\"+$0;
		});
	    };

	    // marker block elision : eliminate nested markers, that are already enclosed in a larger mark block
	    // e.g : <Space<s<S>>tore> => <SpacesStore>, etc...
	    String.prototype.elideHighlightMarkers = function(open_marker_char, close_marker_char)
	    {
		var opened=false; var skip_next_close_stack=[];
		var rebuild=""; var c ='';

		for(var j=0; j< this.length; j++)
		{
		    c = this.charAt(j);
		    if(c == open_marker_char)
		    {
			if(!opened)  { opened=true;rebuild+=c;}
			else skip_next_close_stack.push(true);
		    }
		    else if(c == close_marker_char)
		    {
			if(skip_next_close_stack.length == 0) {rebuild+=c; opened=false;}
			else skip_next_close_stack.pop();
		    }
		    else rebuild+=c;
		}

		return rebuild;
	    };
	},

	/**
	* Load entries and render in the dashlet
	* 
	* @method loadData
	*/
	loadData: function AuditApplication_loadData()
	{
	    // define how each column will be formatted. see the response schema for how they are parsed
	    //{key:"application", label: this.msg("audit.dashlet.field.label.application"), sortable:true,resizeable:true}, // we filter by app so show the app in the header rather than "wasting" a column
	    var myColumnDefs = 
	    [
		{
		    key:"id", label: this.msg("audit.dashlet.field.label.id"), sortable:true,resizeable:true,
				formatter:function(elCell, oRecord, oColumn, oData)
				    {
					elCell.innerHTML = (oData+"").swapHighlightMarkers();
				    }
		},
		{
		    key:"user", label: this.msg("audit.dashlet.field.label.user"), sortable:true,resizeable:true,
				formatter:function(elCell, oRecord, oColumn, oData) 
				    {
					    // instead of "hardcoding" the link to the user profile page, use uri templates
					    // <uri-templates> are loaded from share-config.xml / share-config-custom.xml.
					    // profile page is one of the default predefined uri templates.
					    var template = Alfresco.constants.URI_TEMPLATES["userprofilepage"];
					    var HTMLed_username=(oData+"").swapHighlightMarkers();
					    var unmarked_username=(oData+"").trimHighlightMarkers();

					    // don't display the link if username is null (could be an audited failed login), if the template could not be found
					    // or in portlet mode
					    if( ! (YAHOO.lang.isUndefined(template) || template.length === 0 || Alfresco.constants.PORTLET || unmarked_username == "null"))
					    {
						uri = Alfresco.util.uriTemplate("userprofilepage",{ userid: unmarked_username});
						elCell.innerHTML = "<a href='" + uri + "' class='theme-color-1'>" + HTMLed_username + "</a>";
					    }
					    else
						elCell.innerHTML = HTMLed_username;
				    }
		},
		{
		    key:"time", label: this.msg("audit.dashlet.field.label.time"), sortable:true, resizeable:true,
				formatter:function(elCell, oRecord, oColumn, oData) 
				    {
					if(oData instanceof Date)
					{
					    var oDate= new Date(oData);
					    elCell.innerHTML = YAHOO.util.Date.format(oDate, { format: "%e/%m %H:%M"} );
					}
					else // date object may have been switched by text for highlighting, leave as is
					    elCell.innerHTML = (oData+"").swapHighlightMarkers();
				    }
		},
		{
		    key:"values", label: this.msg("audit.dashlet.field.label.values"), sortable:true,resizeable:true,
				// the formatter is used to make the raw data a little more user friendly, i.e : 
				// 	- if a noderef pattern is detected, include a doclib link to the doc details page
				//  - add html <li> elements around each value, and separate key/value with spacing for readability

				formatter:function(elCell, oRecord, oColumn, oData) 
				    {
					    var arrayAsString="";

					    // noderef_regex      matches :protocol://storeId/uuid
					    // marked_noderef_regex matches :protocol://storeId/relaxed-uuid (any number of chars in each dash-separated group, floating html)

					    // unicode codepoints \uFFFE and \uFFFF are used for submatches opening and closing markers. 
					    // Note for html : also matches \uFFFE and \uFFFF that may be interspersed with the noderef
					    // 	the marked noderef elements are relaxed/not fixed in size, as the number of opening and closing markers may vary 
					    // 	the noderef_regex will enforce the pattern against the unmarked string

					    var noderef_regex        = /[\w]+:\/\/\w+\/[\w]{8}-[\w]{4}-[\w]{4}-[\w]{4}-[\w]{12}/g;
					    var marked_noderef_regex = /[\w\uFFFE\uFFFF]+:[\uFFFE\uFFFF]?([\uFFFE\uFFFF]?\/[\uFFFE\uFFFF]?){2}[\w\uFFFE\uFFFF]+\/[\w\uFFFE\uFFFF]+-[\w\uFFFE\uFFFF]+-[\w\uFFFE\uFFFF]+-[\w\uFFFE\uFFFF]+-[\w\uFFFE\uFFFF]+/g;

					    var valuesArray = oData.split("\n");
					    var multivalued = (valuesArray.length > 1) ; // multivalued = multiple lines for this particular row field

					    for(pair_number in valuesArray)
					    {
						var raw_value=valuesArray[pair_number];
						var audit_key=raw_value.split(":",1);

						var audit_value=raw_value.split(/^[^:]*:/).pop();
						var unmarked_audit_value=audit_value.trimHighlightMarkers();

						var displayed_value=audit_value;

						var matches=audit_value.match(marked_noderef_regex);
						var unmarked_matches=unmarked_audit_value.match(noderef_regex);

						if(unmarked_matches && matches)
						{
						    var link_start="<a href='"+Alfresco.constants.URL_PAGECONTEXT+"document-details?nodeRef=";
						    var link_class="' class='theme-color-1'>";
						    var link_end="</a><br/>";

						    // iterate and replace. just in case the 2 arrays don't have the same length (unlikely), iterate over 
						    // the least long array to avoid out-of-bounds reads
						    for (var match_index = 0; match_index < Math.min(matches.length,unmarked_matches.length); match_index++)
						    {
							    var linked=link_start+$html(unmarked_matches[match_index])+link_class
									    +matches[match_index].swapHighlightMarkers()
									    +link_end;

							    // switch out the plain noderef for a doc details link on that same noderef
							    displayed_value=displayed_value.replace(matches[match_index],linked);
						    }
						}
						// swap out the remaining markers, not part of a link
						displayed_value=displayed_value.swapHighlightMarkers();

						arrayAsString+="<li>"+ (multivalued ?"[ ":"") + (audit_key+"").swapHighlightMarkers()
								     + " : " + displayed_value + (multivalued ?" ] ":"") + "</li>";
					    }
					    elCell.innerHTML = arrayAsString;
				    }
		}
	    ];


	    var auditValueFilterquery = this.options.valueFilter ? "&valueFilter="+encodeURI(this.options.valueFilter) : "";
	    var limitquery            = this.options.limit ? "&limit="+encodeURI(this.options.limit) : "";

	    // add in any optional server side query param. since they will be separated by a '&', encode it with an unassignable
	    // unicode code point. it will be decoded by the data webscript that will perform the actual audit API query call.
	    var additionalQueryParams = this.options.additionalQueryParams ?
		    "&additionalQueryParams="+encodeURI(this.options.additionalQueryParams.replace(/&/g,'\uFFFF')) : "";

	    // build out the URL to the datasource using our own parameters
	    // the call to the "Audit Application Data Component" webscript will handle the actual audit query call to the repo. 
	    // Its repsonse will, as a 1st step, filter out the audit application path to keep the key only for dashlet readability
	    var dataSourceURI=Alfresco.constants.URL_SERVICECONTEXT 
			+  "components/dashlets/audit-application/entries?application=" 
			+ encodeURI(this.options.application) + auditValueFilterquery + limitquery + additionalQueryParams;

	    var myDataSource = new YAHOO.util.DataSource(dataSourceURI);

	    myDataSource.responseType = YAHOO.util.XHRDataSource.TYPE_JSON;
	    myDataSource.connXhrMode  =  "queueRequests"; // If a request is already in progress, wait until response is returned before sending the next request.

	    // the response schema defines how and what to parse from the query response
	    myDataSource.responseSchema = 
	    {
		resultsList: "entries",
		fields: 
		[
		    { key: "id", parser: "number"},
		    //{ key: "application" },  // we filter by app so show the app in the header rather than "wasting" a column              
		    { key: "user" },  
		    { key: "time", parser:function(oData)
					  {
						var unparsed=oData;
						// attempt to "simplify" the date for old/legacy browsers. drop the milliseconds and timezone
						if(YAHOO.env.ua.ie > 0 && YAHOO.env.ua.ie < 7) 
						    oData=oData.replace(/\-/ig, '/').split('.')[0];
						else if (YAHOO.env.ua.ie >= 7)
						    oData=oData.replace(/\-/ig, '/').replace(/T/ig, ' ').replace(/\.\d\d\d/ig,"").replace(/\+.*/ig,"");
						else if ( YAHOO.env.ua.gecko > 0 && YAHOO.env.ua.gecko  <= 1.9)
						    oData=oData.replace(/\-/ig, '/').replace(/T/ig, ' ').split('.')[0];

						var date = new Date(oData);
						if( (date != "Invalid Date") && !isNaN(date))
						    return date;
						else
						    return unparsed;

					  }
		    },
                    { key: "values", parser:function (oData)
					    { 
						// custom parser to get multiple audit key/values pairs as key:pair strings separated by newlines 
						// easier to handle and format later on
						var arrayAsString="";

						var keycount = 0, i=0;
						for(prop in oData) keycount++; //oData not an array, can't rely on length for the properties
						var multivalued = (keycount > 1) ;// audit entry is multivalued (ie has multiple lines)

						for(key in oData)
						{
						    arrayAsString+=key + ":" + oData[key];
						    if(multivalued && i < keycount - 1) 
							arrayAsString+="\n";
						    i++;
						}
						return arrayAsString;
					    } 
		    }

		],
		metaFields: 
		{
		    totalRecords : "count"
		}
	    };

	    var dashlet = this; // needed to use the dashlet object easily inside doBeforeCallBack

	    // used to filter out entries prior to callback. the actual filtering is done in applyRegexFilterOnResponse
	    myDataSource.doBeforeCallback = function (req,raw,res,cb)
	    {
		var currentCount = res.results.length;

		if(req)
		{
		    var filterOutput = dashlet.applyRegexFilterOnResponse(req,res);
		    res.results = filterOutput.filtered;

		    if(filterOutput.regexStatus == "valid")
		    {
			//switch the search background to valid. no need to test with hasClass, YUI dom already does this internally
			Dom.removeClass(dashlet.searchBoxContainer,'invalid-regex');
			Dom.addClass(dashlet.searchBoxContainer,'valid-regex');

			// update the message containing the number of new (now filtered out) results
			var filteredCount = filterOutput.filtered.length;
			dashlet.searchBoxLabelContainer.innerHTML = dashlet.msg("audit.dashlet.filteredResults", filteredCount, currentCount - filteredCount) +" :";
		    }
		    else if(filterOutput.regexStatus == "invalid")
		    {
			//switch the search background to invalid
			Dom.removeClass(dashlet.searchBoxContainer,'valid-regex');
			Dom.addClass(dashlet.searchBoxContainer,'invalid-regex');

			dashlet.searchBoxLabelContainer.innerHTML = dashlet.msg("audit.dashlet.invalidSearch") +" :";
		    }
		}
		else
		{
		    //we're back to an empty filter. remove the invalid-regex styling, if present 
		    Dom.removeClass(dashlet.searchBoxContainer,'invalid-regex');
		    Dom.removeClass(dashlet.searchBoxContainer,'valid-regex');

		    dashlet.searchBoxLabelContainer.innerHTML = dashlet.msg("audit.dashlet.searchWithinResults", currentCount) +" :";
		}


		return res;
	    }

	    // various datatable options
	    var dtOptions = 
	    {
		    paginator: new YAHOO.widget.Paginator(
		    {
			rowsPerPage : this.options.rowsPerPage == "" ? this.options.defaultRowsPerPage : this.options.rowsPerPage,
			firstPageLinkLabel : this.msg("audit.dashlet.firstPageLinkLabel"), 
			previousPageLinkLabel : this.msg("audit.dashlet.previousPageLinkLabel"), 
			nextPageLinkLabel : this.msg("audit.dashlet.nextPageLinkLabel"), 
			lastPageLinkLabel : this.msg("audit.dashlet.lastPageLinkLabel"), 
			pageReportTemplate : this.msg("audit.dashlet.pageReportTemplate")
		    }),
                    //draggableColumns: true, // (optional)
		    MSG_EMPTY: this.msg("audit.dashlet.noEntries"),
		    MSG_LOADING: this.msg("audit.dashlet.loading"),
		    // initial arrow positionning. corresponds to how the data is coming *presorted*, not a 
		    // way to resort input data before browser display !
		    sortedBy:
		    {
			key:"id",
			dir:"desc"
		    }
	    };

	    var myDataTable = new YAHOO.widget.DataTable(this.entriesContainer, myColumnDefs, myDataSource, dtOptions);
	    // can be used to interact with the results. kept as a reference here. 
	    myDataTable.handleDataReturnPayload = function(oRequest, oResponse, oPayload)
	    {
		    return oPayload;
	    };

	    this.entriesDataSource = myDataSource;
	    this.dataTable = myDataTable;

	    // column display/hide
	    this.showOrHideColumn(0,this.options.show_id_column);
	    this.showOrHideColumn(1,this.options.show_user_column);
	    this.showOrHideColumn(2,this.options.show_time_column);
	    this.showOrHideColumn(3,this.options.show_values_column);

	},

	showOrHideColumn : function  AuditApplication_showOrHideColumn(column_number,show)
	{
	    if(show == "show")
	       this.dataTable.showColumn(column_number);
	    else
		this.dataTable.hideColumn(column_number);
	},

	// This is the searchbox filter function 
	// the complete results will be filtered out according to the query before being returned for display 
	applyRegexFilterOnResponse : function AuditApplication_applyRegexFilterOnResponse(req,res) 
	{ 
		var output = {};
		var input    = res.results || []; 
		var filtered = []; 
		var i,l=input.length; 

		// Array.indexOf requires Javascript 1.6. not all supported browsers support this at present, so wrap it
		function indexOfWrapper(array,string_to_match)
		{
		    if(array.indexOf) 
			return array.indexOf(string_to_match);
		    // ...or do it the old-fashioned way
		    else 
		    {
			for(var index=0 ; index < array.length ; index++) 
			{
			    if(array[index] === string_to_match)
				return index;
			}
			return -1;
		    }
		}

		if (req) 
		{ 
			//remove inserted searchWithinResults query param
			var querystring=req.replace("&searchWithinResults=","");

			// inclusion is the default, if is start with a + strip it.
			// no real need to escape since user can use the field to "really" search for a +, eg: field:+
			var negation_predicate_present=false;
			var firstchar=querystring.substr(0,1);

			if (firstchar == "+" || firstchar == "-")
			{
			    querystring = querystring.substr(1); 
			    if(firstchar == "-")
				negation_predicate_present=true;
			}

			var splittedQueryElements = querystring.split(":");
			var isColonSeparated=splittedQueryElements.length > 1;

			// search style : id:614. if a ":" is present in the query, assume the first part is the field to search on
			// if none specified, search is performed on the values field
			// if colon separated get first item and remove it from the array
			var field=isColonSeparated ? splittedQueryElements.shift() : "values"; 

			var to_match = isColonSeparated ? splittedQueryElements.join(":") : querystring;

			// there is sometimes some spurious spaces just after the field definitions. trim them. 
			var to_match = to_match.replace(":",":\\s*");

			var re_to_match;
			try
			{
			    // regex flags : 
			    // 	m : multiline. match ^ and $ against the beginning and end of each line
			    // 	i : case insensitive. Remove the i here to make the search box case-sensitive
			    // 	Note : the 'g' global flag is not needed here. The while 'exec' loop below will take care of the potential multiple matches.
			    //
			    re_to_match = new RegExp(to_match,"mi"); 
			    output.regexStatus="valid";
			}
			catch(e)
			{
			    //switch the search background to valid.no need for hasClass, YUI dom already does this internally
			    output.regexStatus="invalid";
			    output.filtered=filtered

			    return output;
			}

			for (i = 0 ; i < l; ++i) 
			{ 
			    //special case : match date instances to the current display format (see formatter for time column)
			    if (input[i][field] instanceof Date)
				input[i][field] = YAHOO.util.Date.format(input[i][field], { format: "%e/%m %H:%M"} );

			    // just in case, trim existing markers coming from the data and replace with a space, although unlikely
			    // as the markers have been specifically chosen to be non-character codepoints
			    var field_value = (input[i][field]+"").trimHighlightMarkers(" ");

			    var remainder = field_value; //start with the whole string. trim off as we go along matches
			    var at_least_one_match = false;
			    var previous_remaining_match;
			    var matching_strings = [];
			    var deferred_matching_strings = [];

			    // use unassignable/non-characters unicode codepoints as markers. see unicode.org/charts/PDF/uFFF0.pdf
			    // they won't need to be escaped throughout the string
			    var highlight_open_marker ='\uFFFE';
			    var highlight_close_marker ='\uFFFF';

			    while(remaining_match=re_to_match.exec(remainder)) // null if no match
			    {
				at_least_one_match=true;

				// matching strings is used to keep track of what strings we have already highlighted in the
				// current row. indexOf needs Javascript 1.6, so use a wrapper to ensure support
				var alreadyHighlighted = (indexOfWrapper(matching_strings,remaining_match[0]) != -1);

				//if (   (re_to_match.exec(remainder) && !negation_predicate_present ) 
				//  ||   (!re_to_match.exec(remainder) && negation_predicate_present ) )

				// simulated XOR, equivalent to above. 
				// no match regex will be a null
				// negated each element is necesary to force non-booleans (e.g null) into a boolean
				// note : formatting here should be kept to the minimum, as this is the data that will be searched upon by the local filter box
				//    see the columDef's formatter above for displaying other data than the data actually contained by this array element
				if ( (!remaining_match != !negation_predicate_present) && !alreadyHighlighted)
				{
					// replace() replaces the first occurrence, so only use remaining_match[0]. 
					// if there are other matches, they will be dealt with as we move along the string
					var remaining_match_regex = remaining_match[0].sanitizeforHighlighting();

					if(remaining_match[0])
					{
					    // rematch against the remainder to determine the match count at the current position 
					    var remainder_matches=remainder.match(new RegExp(remaining_match_regex,"g"));
					    if(remainder_matches)
					    {
						if(remainder_matches.length > 1)
						{
						    //defer the regex replace until the last match for this particular remaining_match_regex.
						    // the idea is to avoid replacing bits that will be replaced by an encompassing match later
						    // in the string. don't defer the same match twice.
						    if(indexOfWrapper(deferred_matching_strings,remaining_match[0]) == -1)
							deferred_matching_strings.push(remaining_match[0]);
						}
						else
						{
						    // the match is the furthest along on the string. do a global replace
						    // to replace this match and any other previous matches that may have been skipped/deferred
						    field_value=field_value.replace(new RegExp(remaining_match_regex,"g"),highlight_open_marker+remaining_match[0]+highlight_close_marker);
						    matching_strings.push(remaining_match[0]);
						}
					    }
					}
				}

				//trim to keep the rest of the string after the current match index
				// break out of the loop if there is no remainder, or the remainder has not changed 
				// likely $ or ^ only, respectively , in that case
				// also make sure we've gone through the entire input string, even if this current portion does not match
				var new_remainder=remainder.substr(remaining_match[0].length ==0 ? 1 : remaining_match.index + remaining_match[0].length);
				if(!new_remainder || remainder == new_remainder) 
				    break;
				else
				    remainder = new_remainder;

				previous_remaining_match=remaining_match;
			    }

			    // all this additional highlighting work is unncessary if we're looking for negated matches, 
			    // as there will be no highlighting for those
			    if(!negation_predicate_present)
			    {
				// We've moved across the whole string. Go back and replace what we've deferred, if any
				for(var deferred_index = 0; deferred_index < deferred_matching_strings.length; deferred_index++)
				{
				    if(indexOfWrapper(matching_strings,deferred_matching_strings[deferred_index]) == -1)
				    {
					var deferred_regex = new RegExp(deferred_matching_strings[deferred_index].sanitizeforHighlighting(),"g")
					field_value=field_value.replace(deferred_regex,highlight_open_marker+deferred_matching_strings[deferred_index]+highlight_close_marker);
				    }
				}

				// eliminate potential useless successive close open and open close markers
				field_value=field_value.replace(new RegExp(highlight_close_marker+highlight_open_marker,"g"),"")
								    .replace(new RegExp(highlight_open_marker+highlight_close_marker,"g"),"");

				// marker block elision : eliminate nested markers, that are already enclosed in a larger mark block
				// replace the field value with the elided version
				input[i][field]=field_value.elideHighlightMarkers(highlight_open_marker, highlight_close_marker);
			    }

			    // finally, push or not the result to the filtered array 
			    if(!at_least_one_match != !negation_predicate_present) // simulated XOR
				filtered.push(input[i]);  // add it to the list of "visible" results
			} 
			output.filtered = filtered; 
		}
		else
		{
		    //we're back to an empty filter. remove the invalid-regex styling, if present 
		    output.regexStatus="empty";
		    output.filtered=input;
		}

		return output; 
	},

	/**
	* Refresh entries data when the refresh button is manually clicked (and sufficient delay has passed btwn 2 queries)
	* 
	* @method refresh
	*/
	refresh: function AuditApplication_refresh()
	{
	    var oCallback = {
		success : this.dataTable.onDataReturnInitializeTable,
		failure : this.dataTable.onDataReturnInitializeTable,
		scope : this.dataTable,
		argument: this.dataTable.getState() // data payload that will be returned to the callback function
	    };
	    // Sends a request to the DataSource for more data
	    var txnid = this.entriesDataSource.sendRequest(this.searchBoxContainer.value ? "&searchWithinResults=" + this.searchBoxContainer.value : "", oCallback);
	},

	/**
	* Refresh entries data when the search box is updated (and sufficient delay has passed btwn 2 queries)
	* 
	* @method refreshDataTable_SearchWithinResults
	*/
	refreshDataTable_SearchWithinResults :  function AuditApplication_refreshDataTable_searchWithinResults()
	{
	    // get state for the new request. restate how the sorting order the data comes from straight from the datasource
	    var state = this.dataTable.getState();
		state.sortedBy = {key:'id', dir:YAHOO.widget.DataTable.CLASS_DESC};

	    // Get filtered data
	    // If the search box is not empty, we add an internal query param that will not be used by the server, 
	    // but that we will use in doBeforeCallback  to further refine and filter results that do not match the box value
	    var txnid = this.entriesDataSource.sendRequest(this.searchBoxContainer.value ? "&searchWithinResults=" + this.searchBoxContainer.value : "",
	    {
		success : this.dataTable.onDataReturnInitializeTable,
		failure : this.dataTable.onDataReturnInitializeTable,
		scope   : this.dataTable,
		argument: state
	    });
	},


	// do not issue successive refresh requests until a minimum delay (consecutiveRefreshMinimumDelay) 
	// has elapsed between to requests
	lastButtonRefreshEventTimeStamp : null,
	onRefresh: function AuditApplication_onRefresh(e)
	{
	    if (e)
		Event.preventDefault(e); // Stop browser's default click behaviour for the link

	    this.lastButtonRefreshEventTimeStamp = new Date().getTime();
	    var that = this; // "that" is the new "this" :), i.e access the dashlet object (current this) inside setTimeout
	    setTimeout(function() 
	    {
		var currentTime = new Date().getTime();
		if(currentTime - that.lastButtonRefreshEventTimeStamp > that.consecutiveRefreshMinimumDelay) 
		    that.dispatchButtonRefreshRequest();

	    }, that.consecutiveRefreshMinimumDelay + 100);    
	},
	dispatchButtonRefreshRequest : function() 
	{
	    this.refresh();
	},

	// intercept keyup events. to avoid hammering the server, do not actually refresh the datatime until the user 
	// has stopped typing.
	// this "stop" is manifested by 2 keyup events separated by an interval defined by consecutiveRefreshMinimumDelay
	lastKeyUpEventTimeStamp : null,
	onSearchWithinResultsFilterKeyup: function AuditApplication_onSearchWithinResultsFilterKeyup(e)
	{
	    this.lastKeyUpEventTimeStamp = new Date().getTime();
	    var that = this; // "that" is the new "this" :), i.e access the dashlet object (current this) inside setTimeout
	    setTimeout(function() 
	    {
		var currentTime = new Date().getTime();
		if(currentTime - that.lastKeyUpEventTimeStamp > that.consecutiveRefreshMinimumDelay) 
		    that.dispatchKeyupRefreshRequest();

	    }, that.consecutiveRefreshMinimumDelay + 100);    
	},
	dispatchKeyupRefreshRequest : function() 
	{
	    this.refreshDataTable_SearchWithinResults();
	},

	setupBoxListener: function(field)
	{
		var configDialog = this.configDialog;
		YAHOO.util.Event.addListener(Dom.get(configDialog.id + "-checkbox-show_"+field+"_column"), 'click',
		function()
		{
		    Dom.get(configDialog.id + "-show_"+field+"_column").value= (this.checked ? "show" : "hide");
		});

	},

	/**
	* Configuration click handler
	*
	* @method onConfigClick
	* @param e {object} HTML event
	*/
	onConfigClick: function AuditApplication_onConfigClick(e)
	{
	    // config url for this dashlet
	    var actionUrl = Alfresco.constants.URL_SERVICECONTEXT + "modules/dashlet/config/" + encodeURIComponent(this.options.componentId);

	    Event.stopEvent(e);

	    if (!this.configDialog)
	    {
		this.configDialog = new Alfresco.module.SimpleDialog(this.id + "-configDialog").setOptions(
		{
		    width: "50em",

		    // set the template for the config fields, from the "Audit Dashlet Configuration Dialog" webscript
		    templateUrl: Alfresco.constants.URL_SERVICECONTEXT + "modules/dashlet/audit-application/config",
		    actionUrl: actionUrl,
		    onSuccess:
		    {
			fn: function AuditApplication_onConfigure_callback(e)
			{
			    this.options.application = Dom.get(this.configDialog.id + "-application").value;
			    this.options.valueFilter = Dom.get(this.configDialog.id + "-valueFilter").value;
			    this.options.limit = Dom.get(this.configDialog.id + "-limit").value;
			    if(isNaN(this.options.limit)  || (this.options.limit * 1) < 1 )
				this.options.limit = ""; // invalid values (not strictly positive integers ) are dropped

			    this.options.rowsPerPage = Dom.get(this.configDialog.id + "-rowsPerPage").value;
			    if(isNaN(this.options.rowsPerPage)  || (this.options.rowsPerPage * 1) < 1 )
				this.options.rowsPerPage = this.options.defaultRowsPerPage; // invalid values (not strictly positive integers ) are dropped

			    this.options.additionalQueryParams = Dom.get(this.configDialog.id + "-additionalQueryParams").value;

			    //table fields to display. in reverse, we use the 'checked' flag to toggle the html field value and save
			    this.options.show_id_column = Dom.get(this.configDialog.id + "-show_id_column").value;
			    this.options.show_user_column = Dom.get(this.configDialog.id + "-show_user_column").value;
			    this.options.show_time_column = Dom.get(this.configDialog.id + "-show_time_column").value;
			    this.options.show_values_column = Dom.get(this.configDialog.id + "-show_values_column").value;

			    this.init();
			},
			scope: this
		    },
		    doSetupFormsValidation:
		    {
			fn: function AuditApplication_doSetupForm_callback(form)
			{
                            Dom.get(this.configDialog.id + "-application").value = this.options.application;
			    Dom.get(this.configDialog.id + "-valueFilter").value = this.options.valueFilter;

			    // invalid values (not strictly positive integers ) are dropped
			    if(isNaN(this.options.limit)  || (this.options.limit * 1) < 1 )
				Dom.get(this.configDialog.id + "-limit").value = ""; 
			    else
				Dom.get(this.configDialog.id + "-limit").value = this.options.limit;

			    // invalid values (not strictly positive integers ) are dropped
			    if(isNaN(this.options.rowsPerPage)  || (this.options.rowsPerPage * 1) < 1 )
				Dom.get(this.configDialog.id + "-rowsPerPage").value = this.options.defaultRowsPerPage; 
			    else
				Dom.get(this.configDialog.id + "-rowsPerPage").value = this.options.rowsPerPage;

			    // additional audit API server side query params
			    Dom.get(this.configDialog.id + "-additionalQueryParams").value = this.options.additionalQueryParams;

			    //table fields to display
			    Dom.get(this.configDialog.id + "-show_id_column").value          =    this.options.show_id_column;
			    // we use the checkbox value (saved) to position or not the 'checked' flag on the checkbox html element
			    Dom.get(this.configDialog.id + "-checkbox-show_id_column").checked = (this.options.show_id_column == "show");

			    Dom.get(this.configDialog.id + "-show_user_column").value      =    this.options.show_user_column;
			    Dom.get(this.configDialog.id + "-checkbox-show_user_column").checked = (this.options.show_user_column == "show");


			    Dom.get(this.configDialog.id + "-show_time_column").value      =    this.options.show_time_column;
			    Dom.get(this.configDialog.id + "-checkbox-show_time_column").checked = (this.options.show_time_column == "show");


			    Dom.get(this.configDialog.id + "-show_values_column").value    =    this.options.show_values_column;
			    Dom.get(this.configDialog.id + "-checkbox-show_values_column").checked = (this.options.show_values_column == "show");

			    // when a checkbox is clicked, a hidden field will be updated with the checkbox state value.
			    // It's a workaround for the fact that the property persistence service does not seem to like checkboxes
			    this.setupBoxListener("id");
			    this.setupBoxListener("user");
			    this.setupBoxListener("time");
			    this.setupBoxListener("values");


			    // Define AutoComplete controls
			    // Use a XHRDataSource to get the current list of audit applications from the repo as a json response
			    var configDataSource = new YAHOO.util.XHRDataSource(Alfresco.constants.URL_SERVICECONTEXT + "modules/dashlets/audit-application/applist");
			    // Set the responseType
			    configDataSource.responseType = YAHOO.util.XHRDataSource.TYPE_JSON;

			    // map the response schema to the json stream utputted by the "Audit Dashlet Application List" webscript
			    configDataSource.responseSchema = 
			    {
				resultsList: "applications",
				fields : ["name", "path", "enabled"]
			    };

			    // Custom AutoComplete result formatter
			    var formatResult = function(oResultData, sQuery, sResultMatch) 
			    {
				return oResultData.name + " (" + oResultData.path + ")" + "  -  enabled : " + oResultData.enabled;
			    };

			    // Custom event handler to ensure the application name gets saved and posted back
			    var appHandler = function(sType, aArgs)
			    {
				var myAC = aArgs[0]; // reference back to the AC instance
				var elLI = aArgs[1]; // reference to the selected LI element
				var oData = aArgs[2]; // object literal of selected item's result data

				// application is prepended with a space in audit-application-applist.get.json.ftl, so that the user 
				// can get all the whole by searching for a space. save the app without the leading space.
				var appname = oData.name;
				if(appname.substring(0,1)==" ")
				    appname=appname.substring(1);

				myAC.getInputEl().value = appname; 
			    };

			    // Instantiate the application list AutoComplete
			    var configDialogId = this.configDialog.id;
			    var appAutoComplete = new YAHOO.widget.AutoComplete(configDialogId + "-application", configDialogId + "-application-select", configDataSource);
			    appAutoComplete.resultTypeList = false;
			    appAutoComplete.applyLocalFilter = true;
			    appAutoComplete.queryMatchContains = true;
			    appAutoComplete.formatResult = formatResult;
			    appAutoComplete.itemSelectEvent.subscribe(appHandler);

			    // if no app is currently configured, preload the list to display all entries immediately on config popup
			    // the leading space has been intentionnally added by audit-application-applist.get.json.ftl
			    if(Dom.get(configDialogId + "-application").value == "") 
				appAutoComplete.sendQuery(" ");

			    //Instantiate the other field AutoComplete. not needed for now. kept as a reference
			    //var otherAC = new YAHOO.widget.AutoComplete(this.configDialog.id + "-other", this.configDialog.id + "-other-select", configDataSource);
			    //otherAC.useShadow = true;
			    //otherAC.resultTypeList = false;
			    //otherAC.formatResult = formatResult;
			    //otherAC.itemSelectEvent.subscribe(myHandler);
			},
			scope: this
		    }
		});
		}
		else
		{
		    this.configDialog.setOptions(
		    {
			actionUrl: actionUrl
		    });
		}

		this.configDialog.show();
	}
    });
    }
)
();
