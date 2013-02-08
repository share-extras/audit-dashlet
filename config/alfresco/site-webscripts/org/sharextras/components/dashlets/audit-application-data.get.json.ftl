{
   "count": "${auditresponse.count}",
   "entries":
   [
      <#list auditresponse.entries as e>
      {
         <#-- output the ID in 'machine' representation, i.e. wihout any separators of any kind -->
         "id": ${e.id?c},
         "application": "${e.application}",
         <#-- escape quotes that may exist in the persisted values for this entry -->
         "user": "${e.user!'null'?replace('"',"\\\\\\\"",'r')}",
         "time": "${e.time}",
         "values":
         {
         <#list e.values?keys as key>

            <#assign displayed_key=key>
            <#if trimAuditPaths>
               <#-- keep only the audit key for better readability -->
               <#assign displayed_key=key?replace('.*/', '', 'r')>
            </#if>

            <#-- Remove spurious/invalid linebreaks (see ALF-11190) -->
            <#-- and escape quotes that may exist in the persisted values for this entry. -->
            <#-- Note that the various backslashes are required to pass through the evaluation chain. -->
            "${displayed_key}":"${e.values[key]?replace('(\n|\r\n|\r)',' ','r')?replace('"',"\\\\\\\"",'r')}"
            <#if key_has_next>,</#if>
         </#list>
         }
      }<#if e_has_next>,</#if>
      </#list>
   ]
}
