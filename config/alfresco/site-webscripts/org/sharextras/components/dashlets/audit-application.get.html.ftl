<#assign default_height=320>
<#assign el=args.htmlid?js_string>
<script type="text/javascript">//<![CDATA[
   new Extras.dashlet.AuditApplication("${el}").setOptions(
   {
      componentId: "${instance.object.id}",

      <#-- escape quotes in user-entered parameters, just in case -->
      application: "${escape_quotes(args.application!'')}",
      valueFilter: "${escape_quotes(args.valueFilter!'')}",
      limit: "${escape_quotes(args.limit!'')}",
      rowsPerPage: "${escape_quotes(args.rowsPerPage!'10')}",
      pathFilter: "${escape_quotes(args.pathFilter!'')}",
      additionalQueryParams: "${escape_quotes(args.additionalQueryParams!'')}",

      <#-- these values are managed by the dashlet, but escape them anyways, just in case... -->
      show_id_column: "${escape_quotes(args.show_id_column!'show')}",
      show_user_column: "${escape_quotes(args.show_user_column!'show')}",
      show_time_column: "${escape_quotes(args.show_time_colum!'show')}",
      show_values_column: "${escape_quotes(args.show_values_column!'show')}",
      trim_audit_paths: "${escape_quotes(args.trim_audit_paths!'true')}"

   }).setMessages(${messages});

   <#-- dashlet resizer does not dynamically adjust the number of rows displayed on the page re: pagination. -->
   <#-- The number of rows can be configured in the dialog though, sufficient for now. -->
   <#-- future research : subscribe to rowsPerPageChange, "" etc...    -->
   new Alfresco.widget.DashletResizer("${el}", "${instance.object.id}").setOptions(
   {
      <#-- IE (as usual) needs apparently a default height, otherwise resizing may not work in some situations -->
      minDashletHeight: ${default_height}
   });

//]]></script>

<div class="dashlet audit-application-dashlet" id="${el}-dashlet">
   <div class="title" id="${el}-title">${msg("audit.dashlet.header.default")}</div>
   <div class="refresh"><a id="${el}-refresh" href="#">&nbsp;</a></div>


   <div class="toolbar yui-toolbar" id="${el}-toolbar">
      <div class="links spaced-height" id="${el}-links">
         <#-- ie7 float bug : the align-right floated element must be declared before the non-floated (left) one... -->
         <span class="custom-align-right">
            <a class="theme-color-1" href="${msg("audit.dashlet.link.help.url")}" id="${el}-help-link" target="_blank">${msg("audit.dashlet.link.help")}</a>
         </span>

         <#if userHasConfigPermission && userIsAdmin>
         <#-- for some reason, ie6 ignores the inherited left padding of the link -- wrap in a specific span if on ie6 -->
         <!--[if IE 6]>   <span class="spaced-left"> <![endif]-->
         <span>
            <a class="theme-color-1" href="#" id="${el}-configure-link">${msg("audit.dashlet.link.configure")}</a>
         </span>
         <!--[if IE 6]>   </span> <![endif]-->
         </#if>
      </div>
   </div>

   <#-- audit only allows admin to query audit entries. Therefore the dashlet is only usable by admin users. -->
   <#if userIsAdmin>
      <#assign currentHeight=default_height>
      <#if args.height??><#assign currentHeight=args.height></#if>
         <div class="body" style="height: ${currentHeight}px;" id="${el}-body">
            <div class="message spaced-left" id="${el}-message"></div>

            <div class="spaced-left top-padded" id="${el}-searchbox">
               <#-- search box to filter audit values from YUI -->
               <label id="${el}-searchWithinResultsFilterLabel" for="${el}-searchWithinResultsFilter">${msg("audit.dashlet.searchWithinResults",0)} :</label>
               <input type="text" id="${el}-searchWithinResultsFilter">
            </div>

            <div class="entries custom-scrollable-list" id="${el}-entries"></div>
         </div>
   <#else>
      <div class="body spaced-left" id="${el}-body">
         ${msg("audit.dashlet.adminPrivilegesRequired")}
      </div>
   </#if>
</div>

<#-- for safety, escape double quotes in the arguments that will be passed to the instanciated dashlet component options, otherwise the json feed will be invalid. -->
<#-- Takes a string as parameter (cannot be null), and returns the string with double quotes escaped. If the parameter is the empty string, it will be returned as is. -->
<#function escape_quotes string>
   <#if string?has_content>
      <#-- note that the various backslashes are required to pass through the evaluation chain -->
      <#return string?replace('"',"\\\\\\\"",'r')>
   <#else>
      <#return string>
   </#if>
</#function>
