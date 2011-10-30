<#assign el=args.htmlid?js_string>
<div id="${el}-configDialog" class="configure">
   <div class="hd">${msg("audit.dashlet.config.label.header")}</div>
   <div class="bd">
      <form id="${el}-form" action="" method="POST">
         <div class="yui-gd">
            <div class="yui-u first"><label for="${el}-application">${msg("audit.dashlet.config.label.application")} :</label></div>
            <div class="yui-u">
               <input type="text" name="application" id="${el}-application" />
               <div id="${el}-application-select"></div>
            </div>
         </div>
         <div class="yui-gd">
            <div class="yui-u first"><label for="${el}-valueFilter">${msg("audit.dashlet.config.label.valueFilter")} :</label></div>
            <div class="yui-u">
               <input type="text" id="${el}-valueFilter" name="valueFilter" />
            </div>
         </div>
         <div class="yui-gd">
            <div class="yui-u first"><label for="${el}-limit">${msg("audit.dashlet.config.label.limit")} :</label></div>
            <div class="yui-u">
               <input type="text" id="${el}-limit" name="limit" />
            </div>
         </div>
         <div class="yui-gd">
            <div class="yui-u first"><label for="${el}-rowsPerPage">${msg("audit.dashlet.config.label.rowsPerPage")} :</label></div>
            <div class="yui-u">
               <input type="text" id="${el}-rowsPerPage" name="rowsPerPage" />
            </div>
         </div>
         <div class="yui-gd">
            <div class="yui-u first"><label for="${el}-additionalQueryParams">${msg("audit.dashlet.config.label.additionalQueryParams")} :</label></div>
            <div class="yui-u">
               <input type="text" id="${el}-additionalQueryParams" name="additionalQueryParams" />
            </div>
         </div>


        <#-- checkbox fields seem to only persist their state when enabled.-->
        <#-- to workaround this, hidden fields are used to hold states (both enabled (ie show column), and disabled (ie hide column)). -->
        <input type="hidden"  id="${el}-show_id_column" name="show_id_column"/>
        <input type="hidden"  id="${el}-show_user_column" name="show_user_column"/>
        <input type="hidden"  id="${el}-show_time_column" name="show_time_column"/>
        <input type="hidden"  id="${el}-show_values_column" name="show_values_column"/>

         <div class="bdft">
            <input type="submit" id="${el}-ok" value="${msg("button.ok")}" />
            <input type="button" id="${el}-cancel" value="${msg("button.cancel")}" />
         </div>
      </form>
      <br>

      <#-- checkboxes, kept out of the actual form -->
      <div class="yui-gd">
          <div class="yui-u first"><span>${msg("audit.dashlet.config.label.show_fields")} :</span></div>
          <div class="yui-u">
                <input type="checkbox" class="spaced-right" id="${el}-checkbox-show_id_column"     name="checkbox-show_id_column"/>
                    <span class="spaced-right">${msg("audit.dashlet.field.label.id")}</span>

                <input type="checkbox" class="spaced-right" id="${el}-checkbox-show_user_column"   name="checkbox-show_user_column"/>
                    <span class="spaced-right">${msg("audit.dashlet.field.label.user")}</span>

                <input type="checkbox" class="spaced-right" id="${el}-checkbox-show_time_column"   name="checkbox-show_time_column"/>
                    <span class="spaced-right">${msg("audit.dashlet.field.label.time")}</span>

                <input type="checkbox" class="spaced-right" id="${el}-checkbox-show_values_column" name="checkbox-values_column"/>
                    </span class="spaced-right">${msg("audit.dashlet.field.label.values")}</span>
           </div>
      </div>
   </div>
</div>