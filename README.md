Audit Application dashlet for Alfresco Share
============================================

Author: Romain Guinot

This project defines a custom dashlet to display events for any given audit application.

The dashlet will need to have auditing application(s) already configured, and, to be useful, some events captured.
See http://wiki.alfresco.com/wiki/Auditing_(from_V3.4) on how to define audit applications and some samples.

For Alfresco 3.4.4 and above,see also http://wiki.alfresco.com/wiki/Content_Auditing and http://wiki.alfresco.com/wiki/Audit_Filter.

Below is a sample screenshot of the dashlet :  
![Audit Dashlett](/screenshots/en/audit-dashlet-default.png)

Note : the output in the "audited values" field will depend on the configuration of the current audit application 
(ie what data extractors have been configured, if using the access auditor or not, etc ...). 
The default applications output will generally be more verbose. Here, the screenshots are made using 
simple data extractors, for clarity of the captured output.

Installation
------------

The dashlet can be installed on Alfresco 3.4 and above.

* **Users : Prebuilt jar**

    A prebuilt jar is provided. You only need to copy it to `tomcat/shared/lib` (create the `lib` directory if it does not exist).

* **Developers : Building the jar**

    For developers, an Ant build script is provided to build a JAR file containing the
    custom files, which can then be installed into the `tomcat/shared/lib` folder
    of your Alfresco installation.

    To build the JAR file, run the following command from the base project directory.

        ant clean dist-jar

    The command should build a JAR file named sample-audit-dashlet.jar in the 'dist' directory within your project.

    To deploy the dashlet files into a local Tomcat instance for testing, you can
    either copy the jar file in e.g. the 'tomcat/shared/lib' folder or use the hotcopy-tomcat-jar task. For the latter, You will need to set the tomcat.home
    property in Ant :

        ant -Dtomcat.home=C:/Alfresco/tomcat clean hotcopy-tomcat-jar

    Once you have run this you will need to restart Tomcat so that the classpath resources in the JAR file are picked up.

    As an alternative, you may also copy the exploded files in your classpath, but they must have the same classpath tree
    than the one in the jar. If using development/debug mode for the web framework, you will not need to restart tomcat,
    but you may have to clear your browser's cache.

Using the dashlet
-----------------

 * **Adding the dashlet**

  - Log in to Alfresco Share and navigate to a site where you are a Site Manager, or to your user dashboard.
  - Click the `Customize Dashboard`button to edit the contents of the dashboard. Drag the `Audit Application` dashlet into one of the columns from the list of dashlets to add it.
  - Click `OK` to save the configuration.
  - The dashlet should now be shown in your dashboard.

  Note : querying audit data is restricted by the Alfresco repository to users with administrator privileges. 
  Therefore, only admin users will be able to use the dashlet and view audit data.


 * **Configuration** :

    Click `Configure` to choose an existing audit application. Results will appear as you type and will be matched
    against the live list of audit applications as reported by /api/audit/control.

    For convenience, the list will pop out when opening the configure dialog with no applications currently configured.
    Could be useful if you don't know what application name to search for.

    The number of data rows (audit events) displayed per page is configurable with the 'Entries per page' parameter. It defaults to 10.

    Additional server side filters are configurable :

            UI Name                |              Description                                                                      |  Audit API corresponding parameter
    ------------------------------ | --------------------------------------------------------------------------- | ------------------------------------
     Value Filter                  | filter on the audit value (exact match, optional)                           | 'value'
     Max Entry Count               | maximum number of audit entries retrieved (optional)                        | 'limit' (default 100)
     Audit Path Filter             | select only the audit entries with a matching audit path key (optional) (1) | URL path after application (default none)
     Additional Query params       | other possible server-side query parameters (optional). Separated by &  (2) | from/to time, from/to id, user, valueType, ...


    (1) The match must occur in the values map for that key within the entry.  
    (2) See http://wiki.alfresco.com/wiki/Auditing_(from_V3.4)#Advanced_Query for more information.  


    - The columns to display are also configurable (show/hide).

    - The output in the "audited values" field will depend on the configuration of the current audit application.
      (ie what data extractors have been configured, if using the access auditor or not, etc...).

    - Querying for values when an audit path query is configured will restrict the search to entries with that value for that specific audit path.

    - The "Trim Audit Paths" checkbox can be used to show the full audit paths up to the audit key, or just the audit key, in the audit values.
      It can be useful to temporarily turn on in case one wants to use the audit path filter above, as it will show the full audit paths required for that filter.

    - The data webscript does a version check to determine if a workaround for the unquoted json feed prior to 3.4.3 Enterprise / 4.0 Community (ALF-8307) is required.
      This can be overriden by copying the webscript config file (audit-application-data.get.config.xml) in the equivalent path in web-extension, if required.


    Below is a screenshot of the current configuration dialog :  
    
    ![Audit Dashlett](/screenshots/en/audit-dashlet-configuration-dialog.png)

 * **Search box**

    The dashlet search box allows more search capabilities than the server side filter, ie :
    - Field to search on (regex or not), e.g :  

            id:14  
            id:1.95$  
            name:romain  

        etc...  
        If not specified, the 'values' field will be assumed.


    - Negation, e.g  

            -name:ro  
            -values:pro  

    - Multiline matches are enabled, ^ and $ will match beginning and end of lines for audit values,
        useful since there can be more than one line per audit entry.

    - Query can match anywhere in the field by default. Queries can be any valid javascript regular expression. Examples :  

            ^romain  
            values:r.m...$  
            id:\d\d8  
            -time:21  

      The search box will turn green or red if the regex is valid or invalid, respectively.
      The query can be restricted to the beginning by using ^romain (standard regex), for example.
      See https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/regexp for more details.

      Each match of the regex in the audit entry will be highlighted. Deferred submatches are also supported for highlighting.

    - To search for a colon (:), use the field prefix, eg; field:.+:.+ or values:[^:]+: etc... otherwise the colon will be interpreted
        as a field identifier.

    - Noderefs in the audit values will be detected, and "enhanced" with a link to the docdetails page of that noderef.

    - Multi field search is currently not supported, e.g +id:95 -name:romain. Would have to support ( ), and/or grouping, etc...

    This search is done by filtering out undesired entries coming from the datasource prior to browser display.

Screenshots
-----------

Some sample screenshots with different configurations are included below :  

1. filtering with regular expressions :

   ![Audit Dashlett](/screenshots/en/audit-dashlet-field-regex.png)  
   This search is done by filtering out undesired entries coming from the datasource prior to browser display.


2. transforming noderef into links :

   ![Audit Dashlett](/screenshots/en/audit-dashlet-noderef-links.png)

3. using the [Access Auditor](http://wiki.alfresco.com/wiki/Content_Auditing#Audit_Data_Generated_By_AccessAuditor), with 'Trim Audit Paths' de-selected :

   ![Audit Dashlett](/screenshots/en/audit-dashlet-full-auditPaths.png)

4. etc...

Changelog
---------

0.56:

    - prevent a form a stored XSS in the stored audit values. Addresses GitHub issue #7.
    - replaced the use of the YUI compressor ant task by a call to the jar directly as the ant task seems to be incompatible with current underlying dependencies
    - fixed a small unrelated typo
    - no new features

0.55:

    - switched back to using the previous, alfresco-provided, JSON parsing utility rather than JSON.parse, which is not available in all supported versions for this dashlet (issue #5).
    - no new features

0.54:

    - replaced the remaining eval calls by JSON.parse, for safety and improved parsing performance
    - adjusted the application list autocomplete so it shows the full list of applications when the config field is cleared
    - minor variable name change
    - no new features

0.53:

    - updated README to mention that the Alfresco repository restricts access to audit data to repository administrators only. Only admins will therefore be able to use the dashlet.
    - README update addresses reported issue #3.
    - no new features or bugfixes

0.52:

    - fixed javascript issue with non-admin users. Addresses (new) Github issue #1.

0.51:

    - no new features or bugfixes
    - moved README to markdown syntax as part of the migration to GitHub
    - updated the help link to point to GitHub instead of the wiki on Google Code
    - small css class name changes

0.5:

    - fixed config dialog URL to use /res, required in 4.2. addresses issue 129.
    - added the configurable server-side ability to query for entries containing a specific audit path.
         Note : querying for values when an audit path query is configured will restrict the search to entries with that value for that specific audit path.
    - made the repo version check configurable through the audit application data webscript config file
    - made the audit path trimming configurable through the config dialog
    - minor : added the year by default in the displayed timestamps.
    - fixed ID format for json entries, to make sure the ID representation does not have comma separators for high entry IDs. addresses issue 129, comment #6.
    - fixed an unreported issue where storing config values with double quotes in the text would prevent the config options to be loaded afterwards.

0.45:

    - refined workaround against unquoted json feed for application and user json properties
    - apply this workaround only when running against a repository affected by the bug
    - minor CSS fix : historical margins for dashlet body no longer required.

0.44:

    - expanded workaround against unquoted json feed for application and user json properties. addresses issue 71.
    - additional newline sanitizing of the server side json feed, in addition to the checks already present in the freemarker output. possibly addresses issue 82.
    - rationalized indentation to 3 spaces and cleanup the tabs that have built up over time

0.43:

    - allow the 'additional' query string to override any other configured options, not just the sort order
    - switched the copyright header from 'Share Extras project' to 'Share Extras contributors'

0.42:

    - switched to share extras namespace
    - some comments and jsdoc review
    - aligned rowsPerPage / defaultRowsPerPage data types
    - merged some build.xml changes from upstream

0.41:

    - better IE support
    - some css cleanup
    - some UI label changes
    - updated YUI compressor to 2.4.7
    - leading/trailing whitespaces cleanup

0.4:

    - datatable columns can now be configured to be shown or hidden
    - an extra field has been added to the config dialog to pass additional server side query parameters.
        See the wiki documentation (http://wiki.alfresco.com/wiki/Auditing_(from_V3.4)#Advanced_Query) and the web script description.
    - datatable css fix for google chrome, and various css tweaks
    - Added help link opposite the config link
    - tweaked what links (configure, help) are shown to admins / site managers

0.31:

    - build.properties more consistent with other projects
    - distributed jar had a wrong french bundle filename
    - added small precision in the README

0.3:

    - some formatting, commenting, refactored to separate search box UI background coloring from the actual filtering
    - highlighting can now be expressed with CSS, rather than hardcoded html bold
    - deferred submatches highlighting support
    - marker block elision
    - results message altered
    - search box only shown when an audit application has been configured
    - application config will expand immediately on popup if no app is currently configured
    - better cross-browser support
    - rows per page now configurable in the config dialog

0.22:

    - small bug fix   : regex remainder fix
    - bug fix : generated docdetails and profile links were incorrect when a regex search was already in progress
    - lots of other small regex corner cases fixed
    - search box background now green or red, depending on whether or not the user search is a valid regex or not, respectively
    - ability to list all applications in the config dialog by searching for a leading space, if one does not know what to search for
    - renamed some files and web scripts URLs

0.21:

    - small bug fixes : highlighting multiple matches and regression when clearing the search box

0.2 :

    - search box / query filtering

0.1 :

    - initial release
