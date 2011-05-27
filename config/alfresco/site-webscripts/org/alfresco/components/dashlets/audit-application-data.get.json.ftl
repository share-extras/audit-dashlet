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
		    "${key?replace('.*/', '', 'r')}":"${e.values[key]}"
		    <#if key_has_next>,</#if>
		</#list>
	    }
	}<#if e_has_next>,</#if>
    </#list>
   ]
}

                        