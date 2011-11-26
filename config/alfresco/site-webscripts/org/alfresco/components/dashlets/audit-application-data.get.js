function main()
{
   var application = args.application;	// audit application name (as reported by /api/audit/control
   var valueFilter = args.valueFilter; 	// optional : "value" filter on the audit entries. match all
   var limit = args.limit;		//  optional : max entry count retrieved by the repo query

   // optional : free field to add in other server-side filters (e.g fromTime... )
   var additionalQueryParams = args.additionalQueryParams;

   if (application != null)
   {
      var valueFilterQuery = valueFilter ? "&value=" + stringUtils.urlEncode(valueFilter) : "";
      if(logger.isLoggingEnabled())
	  logger.log("  application:" +application+ " - " + "valueFilter:" +valueFilter);

      var maxEntryCount = limit ? "&limit=" + stringUtils.urlEncode(limit) : "";

      // decode the '&' param separators from the optional additional params passed in by the dashlet.
      var optionalAdditionalQueryParams = additionalQueryParams ? ("&" + additionalQueryParams.replace(/\uFFFF/g,'&')) : "";

      if(logger.isLoggingEnabled())
	  logger.log("  optionalAdditionalQueryParams: '" +optionalAdditionalQueryParams+ "'");

      var sortOrder =  "&forward=" + false; // most recent first

      var uri = "/api/audit/query/"+stringUtils.urlEncode(application)+"?verbose=true"
		  + valueFilterQuery + sortOrder + maxEntryCount + optionalAdditionalQueryParams;

      var connector = remote.connect("alfresco");
      var result = connector.get(uri);
      if(logger.isLoggingEnabled())
	  logger.log("called URI:'"+uri+"'");

      if (result.status == status.STATUS_OK)
      {
	 var rawresponse = result.response+""; // cast rawresponse back into a js string
	 //if(logger.isLoggingEnabled()) logger.log("rawresponse:\n"+rawresponse);

         // the json outputted by the audit template does not quote user and application keys in the ouput
	 // pending ALF-8307, working around it by adding the quotes with a regex replace
	 var requoting_regex = /:(\w+)\,/g;
	 var requoted_response = rawresponse.replace(requoting_regex, ":\"$1\",");
	 //if(logger.isLoggingEnabled()) logger.log("requoted_response:\n"+requoted_response);

         var auditresponse = eval("(" + requoted_response + ")");
	 model.auditresponse = auditresponse;
         model.jsonResp = result.response;
      }

      else
      {
         status.setCode(result.status, "Error during remote call. " +
               "Status: " + result.status + ", Response: " + result.response);
         status.redirect = true;
      }
   }
   else
   {
      status.setCode(status.STATUS_BAD_REQUEST, "No application was specifed");
      status.redirect = true;
   }
}
main();
