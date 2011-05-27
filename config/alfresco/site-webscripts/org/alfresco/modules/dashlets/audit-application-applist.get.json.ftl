{
   "applications": 
   [
	<#list auditcontrol.applications as app>
	{
	    <#-- app names are prepended by a space for convenience -->
	    <#-- This will allow users to see the full list by searching for a leading space. -->
	    "name": " ${app.name}", 
	    "path": "${app.path}",
	    <#-- app.enabled is a boolean so output it as a string --> 
	    "enabled": "${app.enabled?string}"
	}<#if app_has_next>,</#if>
	</#list>
   ]
}