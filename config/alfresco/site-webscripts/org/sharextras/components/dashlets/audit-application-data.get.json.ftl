{
   "count": "${auditresponse.count}",
   "entries":
   [
      <#list auditresponse.entries as e>
      {
         "id": ${e.id},
         "application": "${e.application}",
         <#-- escape quotes that may exist in the persisted values for this entry -->
         "user": "${e.user?replace('"',"\\\\\\\"",'r')}",
         "time": "${e.time}",
         "values":
         {
         <#list e.values?keys as key>
            <#-- keep only the audit key for readability, remove spurious/invalid linebreaks (see ALF-11190) -->
            <#-- and escape quotes that may exist in the persisted values for this entry. -->
            <#-- Note that the various backslashes are required to pass through the evaluation chain. -->
           "${key?replace('.*/', '', 'r')}":"${e.values[key]?replace('(\n|\r\n|\r)',' ','r')?replace('"',"\\\\\\\"",'r')}"
            <#if key_has_next>,</#if>
         </#list>
         }
      }<#if e_has_next>,</#if>
      </#list>
   ]
}
