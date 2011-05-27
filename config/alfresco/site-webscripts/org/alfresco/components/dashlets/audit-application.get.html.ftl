<#assign default_height=320>
<#assign el=args.htmlid?js_string>
<script type="text/javascript">//<![CDATA[
   new Alfresco.dashlet.AuditApplication("${el}").setOptions(
	{
	    "componentId": "${instance.object.id}",
	    "application": "${args.application!''}",
	    "valueFilter": "${args.valueFilter!''}",
	    "limit": "${args.limit!''}",
	    "rowsPerPage" : "${args.rowsPerPage!'10'}"
	}).setMessages(${messages});

    <#-- dashlet resizer does not dynamically adjust the number of rows displayed on the page re: pagination -->
    <#-- the number of rows can be configured in the dialog though, sufficient for now -->
    <#-- future research : subscribe to rowsPerPageChange, "" etc ...    -->
    new Alfresco.widget.DashletResizer("${el}", "${instance.object.id}").setOptions(
	{
	    <#-- IE (as usual) needs apparently a default height, otherwise resizing may not work in some situations --> 
	    "minDashletHeight": ${default_height}
	});

//]]></script>

<div class="dashlet audit-application-dashlet" id="${el}-dashlet">
    <div class="title" id="${el}-title">${msg("audit.dashlet.header.default")}</div>
    <div class="refresh"><a id="${el}-refresh" href="#">&nbsp;</a></div>

    <#-- audit only allows admin to query audit entries. therefore the dashlet is only usable by admin users. -->
    <#if userHasConfigPermission && userIsAdmin>
    <div class="toolbar" id="${el}-toolbar">
	<a class="theme-color-1" href="#" id="${el}-configure-link">${msg("audit.dashlet.link.configure")}</a>
    </div>

    <#assign currentHeight=default_height>
    <#if args.height??><#assign currentHeight=args.height></#if>
	<div class="body" style="height: ${currentHeight}px;" id="${el}-body">
	    <div class="message" id="${el}-message"></div>

	    <div class="markup" id="${el}-searchbox">
		<#-- search box to filter audit values from YUI --> 
		<label id="${el}-searchWithinResultsFilterLabel" for="${el}-searchWithinResultsFilter">${msg("audit.dashlet.searchWithinResults",0)} :</label> 
		<input type="text" id="${el}-searchWithinResultsFilter">
	    </div>

	    <div class="entries customScrollableList" id="${el}-entries"></div>
	</div>

    <#else>
	<div class="body" id="${el}-body">
	    ${msg("audit.dashlet.adminPrivilegesRequired")}
	</div>
    </#if>
</div>

