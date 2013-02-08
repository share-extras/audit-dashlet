function main()
{
   // read this webscript's config.
   var scriptConfig = new XML(config.script);
   var enableVersionCheck = (scriptConfig["enableVersionCheck"] == "true");

   if (logger.isLoggingEnabled())
      logger.log("script config - enableVersionCheck : " +enableVersionCheck);

   var application = args.application;    // audit application name (as reported by /api/audit/control)
   var valueFilter = args.valueFilter;    // optional : "value" filter on the audit entries. match all
   var limit = args.limit;                // optional : max entry count retrieved by the repo query

   var pathFilter = args.pathFilter;      // optional : select only the audit entries which possess a matching audit path key in their values map.
   var additionalQueryParams = args.additionalQueryParams;     // optional : free field to add in other server-side filters (e.g fromTime...)

   // optional : keep only the audit key for better readability / shorter text.
   // Path trimming applies to the freemarker template, so push it into the model.
   model.trimAuditPaths = (args.trimAuditPaths ? (args.trimAuditPaths == "true") : false);
   if (logger.isLoggingEnabled())
      logger.log("trimAuditPaths:" +model.trimAuditPaths);

   if (application != null)
   {
      var valueFilterQuery = valueFilter ? "&value=" + stringUtils.urlEncode(valueFilter) : "";
      var maxEntryCount = limit ? "&limit=" + stringUtils.urlEncode(limit) : "";

      // this pathFilter is not a URL argument, it will be appended to the application name.
      // Note : pending the ability to call the urlEncoder with reserveUriChars set to true, only the '/' are decoded back with a regex replace for use by the repo audit webscript.
      var pathFilterQuery = pathFilter ? (stringUtils.urlEncode(pathFilter)+"").replace(/\%2f/g,'/') : "";

      if (logger.isLoggingEnabled())
         logger.log("  application:" +application+ " - " + "  - pathFilterQuery: '" +pathFilterQuery+ "'" + "valueFilterQuery:" +valueFilterQuery);

      // decode the '&' param separators from the optional additional params passed in by the dashlet, and encode the rest with the standard encoder (see note above).
      var optionalAdditionalQueryParams = additionalQueryParams ? ("&" + encodeURI(additionalQueryParams.replace(/\uFFFF/g,'&'))) : "";
      if (logger.isLoggingEnabled())
         logger.log("  optionalAdditionalQueryParams: '" +optionalAdditionalQueryParams+ "'");

      var sortOrder =  "&forward=" + false; // most recent first

      // build the query URL using all the required parameters and perform the request.
      // Note optionalAdditionalQueryParams is unencoded, pending the ability to call the urlEncoder with reserveUriChars set to true.
      var uri = "/api/audit/query/"+stringUtils.urlEncode(application) +  "/" + pathFilterQuery +"?verbose=true"
                  + optionalAdditionalQueryParams + valueFilterQuery + maxEntryCount + sortOrder;

      var connector = remote.connect("alfresco");
      var result = connector.get(uri);
      if (logger.isLoggingEnabled())
         logger.log("called URI:'"+uri+"'");


      if (result.status == status.STATUS_OK)
      {
         var rawresponse = result.response+""; // cast rawresponse back into a js string
         //if (logger.isLoggingEnabled()) logger.log("rawresponse:\n"+rawresponse);

         var jsonQuoteFixRequired = false;
         if(enableVersionCheck)
         {
            if (logger.isLoggingEnabled())
               logger.log("versionCheck is enabled, will check repo version");
            jsonQuoteFixRequired = isJsonQuoteFixRequired(connector);
         }

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
