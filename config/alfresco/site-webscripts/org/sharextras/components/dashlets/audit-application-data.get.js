function main()
{
   var application = args.application;    // audit application name (as reported by /api/audit/control)
   var valueFilter = args.valueFilter;    // optional : "value" filter on the audit entries. match all
   var limit = args.limit;                // optional : max entry count retrieved by the repo query

   // optional : free field to add in other server-side filters (e.g fromTime...)
   var additionalQueryParams = args.additionalQueryParams;

   if (application != null)
   {
      var valueFilterQuery = valueFilter ? "&value=" + stringUtils.urlEncode(valueFilter) : "";
      if (logger.isLoggingEnabled())
         logger.log("  application:" +application+ " - " + "valueFilter:" +valueFilter);

      var maxEntryCount = limit ? "&limit=" + stringUtils.urlEncode(limit) : "";

      // decode the '&' param separators from the optional additional params passed in by the dashlet.
      var optionalAdditionalQueryParams = additionalQueryParams ? ("&" + additionalQueryParams.replace(/\uFFFF/g,'&')) : "";

      if (logger.isLoggingEnabled())
         logger.log("  optionalAdditionalQueryParams: '" +optionalAdditionalQueryParams+ "'");

      var sortOrder =  "&forward=" + false; // most recent first

      var uri = "/api/audit/query/"+stringUtils.urlEncode(application)+"?verbose=true"
                  + optionalAdditionalQueryParams + valueFilterQuery + maxEntryCount + sortOrder;

      var connector = remote.connect("alfresco");
      var result = connector.get(uri);
      if (logger.isLoggingEnabled())
      logger.log("called URI:'"+uri+"'");


      if (result.status == status.STATUS_OK)
      {
         var rawresponse = result.response+""; // cast rawresponse back into a js string
         //if (logger.isLoggingEnabled()) logger.log("rawresponse:\n"+rawresponse);

         var jsonQuoteFixRequired = isJsonQuoteFixRequired(connector);
         if (logger.isLoggingEnabled())
            logger.log("jsonQuoteFixRequired:'"+jsonQuoteFixRequired+"'");

         var json_requoted_response = rawresponse;
         if(jsonQuoteFixRequired)
         {
            // the json outputted by the audit template does not quote user and application keys in the ouput.
            // Pending ALF-8307, working around it by adding the quotes with a regex replace.
            // Constrain the regex to only 'application' and 'user' entries, and expand the criteria to allow any character except quotes,  in these field values.
            var json_requoting_regex = /"(application|user)":([^"]+)\,$/gm;
            json_requoted_response   = rawresponse.replace(json_requoting_regex,"\"$1\":\"$2\",");
            //if (logger.isLoggingEnabled()) logger.log("json_requoted_response:\n"+json_requoted_response);
         }

         // replace with a space spurious newlines that could have been stored in a json item, before the feed gets eval'd. see also ALF-11190.
         var escaped_response = json_requoted_response.replace(/(\n|\r\n|\r)/g, " ");
         //if (logger.isLoggingEnabled()) logger.log("escaped_response:\n"+escaped_response);

         var auditresponse = eval("(" + escaped_response + ")");
         model.auditresponse = auditresponse;
         model.jsonResp = result.response;
      }

      else
      {
         status.setCode(result.status, "Error during remote call. Status: " + result.status + ", Response: " + result.response);
         status.redirect = true;
      }
   }
   else
   {
      status.setCode(status.STATUS_BAD_REQUEST, "No application was specifed");
      status.redirect = true;
   }
}

// ALF-8307 (missing quotes around audit application and user) is fixed in Enterprise 3.4.3 and Community 4.0.a, and above.
// Determine is the fix is required, depending on the current version of the repository the web-tier is currently running against.
function isJsonQuoteFixRequired(connector)
{
   // get current server version to determine if a workaround for ALF-8307 is needed.
   var srvInfo = connector.get("/api/server");
   var srvInfoJson = eval('(' + srvInfo + ')');

   var serverVersion, serverEdition, serverVersionNumbers;

   // setup defaults
   serverVersion = srvInfoJson.data ? srvInfoJson.data.version : "1.0.0";
   serverEdition = srvInfoJson.data ? srvInfoJson.data.edition : "Enterprise";

   // if Enterprise edition, extract x.y.z from the version number. if community, only extract x.y (exclude service packs).
   if (serverEdition == "Enterprise")
   {
      serverVersionNumbers = ((serverVersion.substr(0,5).replace(/\./g,""))*1); // extract x.y.z from the version number (i.e, include service pack).
      if (logger.isLoggingEnabled())
         logger.log("Enterprise serverVersionNumbers:'"+serverVersionNumbers+"'");
      return (serverVersionNumbers < 343);
   }
   else if (serverEdition == "Community")
   {
       serverVersionNumbers = ((serverVersion.substr(0,3).replace(/\./g,""))*1); // extract x.y from the version number (i.e, exclude service pack).
       if (logger.isLoggingEnabled())
          logger.log("Community serverVersionNumbers:'"+serverVersionNumbers+"'");
       return (serverVersionNumbers < 40);
   }
   else
      return true; // apply the fix if unhandled / different edition.
}

main();
