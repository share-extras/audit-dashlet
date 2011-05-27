<div id="${args.htmlid}-configDialog" class="configure">
   <div class="hd">${msg("audit.dashlet.label.header")}</div>
   <div class="bd">
      <form id="${args.htmlid}-form" action="" method="POST">
         <div class="yui-gd">
            <div class="yui-u first"><label for="${args.htmlid}-application">${msg("audit.dashlet.label.application")} :</label></div>
            <div class="yui-u">
               <input type="text" name="application" id="${args.htmlid}-application" />
               <div id="${args.htmlid}-application-select"></div>
            </div>
         </div>
         <div class="yui-gd">
            <div class="yui-u first"><label for="${args.htmlid}-valueFilter">${msg("audit.dashlet.label.valueFilter")} :</label></div>
            <div class="yui-u">
               <input type="text" name="valueFilter" id="${args.htmlid}-valueFilter"/>
            </div>
         </div>
         <div class="yui-gd">
            <div class="yui-u first"><label for="${args.htmlid}-limit">${msg("audit.dashlet.label.limit")} :</label></div>
            <div class="yui-u">
               <input type="text" name="limit" id="${args.htmlid}-limit"/>
            </div>
         </div>
         <div class="yui-gd">
            <div class="yui-u first"><label for="${args.htmlid}-rowsPerPage">${msg("audit.dashlet.label.rowsPerPage")} :</label></div>
            <div class="yui-u">
               <input type="text" name="rowsPerPage" id="${args.htmlid}-rowsPerPage"/>
            </div>
         </div>
         <div class="bdft">
            <input type="submit" id="${args.htmlid}-ok" value="${msg("button.ok")}" />
            <input type="button" id="${args.htmlid}-cancel" value="${msg("button.cancel")}" />
         </div>
      </form>
   </div>
</div>