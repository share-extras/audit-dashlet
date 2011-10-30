{
   "count": "${auditresponse.count}",
   "entries": 
   [
    <#list auditresponse.entries as e>
	{
	    "id": "${e.id}",
	    "application": "${e.application}",
	    "user": "${e.user}",
	    "time": "${e.time}",
	    "values":
	    {
		<#list e.values?keys as key>
		    <#-- keep only the audit key for readability -->
		    <#-- and remove spurious/invalid linebreaks (see ALF-11190) -->
		    "${key?replace('.*/', '', 'r')}":"${e.values[key]?replace('(\n|\r\n|\r)',' ','r')}"
		    <#if key_has_next>,</#if>
		</#list>
	    }
	}<#if e_has_next>,</#if>
    </#list>
   ]
}

                        