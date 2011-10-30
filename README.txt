Audit Application dashlet for Alfresco Share
============================================

Author: Romain Guinot

This project defines a custom dashlet to display events for any given audit application. 

The dashlet will need to have auditing application(s) already configured, and, to be useful, some events captured.
See http://wiki.alfresco.com/wiki/Auditing_(from_V3.4) on how to define audit applications and some samples. 

From 3.4.4, also see http://wiki.alfresco.com/wiki/Content_Auditing and http://wiki.alfresco.com/wiki/Audit_Filter.

Installation
------------

The dashlet has been developed to install on top of an existing Alfresco 3.4 installation.

* Users : Prebuilt jar

    A prebuilt jar is provided. You only need to copy it to <tomcat-home>/shared/lib.

* Developers : Building the jar

    For developers, an Ant build script is provided to build a JAR file containing the
    custom files, which can then be installed into the 'tomcat/shared/lib' folder
    of your Alfresco installation.

    To build the JAR file, run the following command from the base project
    directory.

	ant clean dist-jar

    The command should build a JAR file named sample-audit-dashlet.jar in the 'dist' directory within your project.

    To deploy the dashlet files into a local Tomcat instance for testing, you can
    use the hotcopy-tomcat-jar task. You will need to set the tomcat.home
    property in Ant.

	ant -Dtomcat.home=C:/Alfresco/tomcat clean hotcopy-tomcat-jar

    Once you have run this you will need to restart Tomcat so that the classpath resources in the JAR file are picked up.

    As an alternative, you may also copy the exploded files in your classpath, but they must have the classpath tree
    than the one in the jar. If using development/debug mode for the web framework, you will not need to restart tomcat,
    but you may have to clear your browser's cache.

Using the dashlet
-----------------

Log in to Alfresco Share and navigate to a site or user dashboard. Click the  'Customize Dashboard' button to edit the contents
of the dashboard and drag the dashlet into one of the columns from the list of dashlets.

 * Configuration : 

    Click Configure to choose an existing audit application. Results will appear as you type and will be matched 
    against the live list of audit applications as reported by /api/audit/control. 

    For convenience, the list will pop out when opening the configure dialog with no applications currently configured.
    Could be useful if you don't know what application name to search for.

    The number of data rows (audit events) per page is configurable by the 'Entries per page' parameter.

    Additional server side filters are configurable :
      UI Name          		Description                                              Audit API corresponding parameter
      -----------------------------------------------------------------------------------------------------------
    - value filter		filter on the audit value (exact match,optional)		'value'
    - limit			maximum number of audit entries retrieved (optional)		'limit'
    - Additional Query params	other possible query parameters (optional)			from/to time, from/to id, user

    (See http://wiki.alfresco.com/wiki/Auditing_(from_V3.4)#Advanced_Query). This filtering is done server-side.

    The columns to display are also configurable (show/hide).

 * Search box
 
    The dashlet search box allows more search capabilities than the server side filter, ie : 
    - field to search on (regex or not), e.g : 
	id:14
	id:1.95$
	name:romain
	etc...

    - negation, e.g
	-name:ro
	-values:pro

    - mutliline matches are enabled, ^ and $ will match beginning of lines for audit values, 
      useful since there can be more than one line per audit entry

    - query can match anywhere in the field by default. queries can be any valid javascript regular expression.
      examples : ^romain, values:r.m...$ , id:\d\d8, -time:21 ...
      The search box will turn green or red if the regex is valid or invalid, respectively
      query can be restricted to the beginning by using ^romain (standard regex) for example.
      See https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/regexp for more details.

      Each match of the regex in the audit entry will be highlighted. Deferred submatches are also supported for highlighting. 

    - to search for a colon (:), use the field prefix, eg; field:.+:.+ or values:[^:]+: etc... otherwise the colon will be interpreted
      as a field identifier
    
    - noderefs in the audit values will be detected, and "enhanced" with a link to the docdetails page of that noderef

    - multi field search is currently not supported, e.g +id:95 -name:romain. Would have to support ( ) , and/or grouping ,etc ...

    This search is done by filtering out undesired entries coming from the datasource prior to browser display.

Changelog
---------
0.4:
    - datatable columns can now be configured to be shown or hidden
    - an extra field has been added to the config dialog to pass additional server side query parameters.
	See the wiki documentation (http://wiki.alfresco.com/wiki/Auditing_(from_V3.4)#Advanced_Query) and the web script description.
    - datatable css fix for google chrome, and various css tweaks
    - Added help link opposite the config link

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

0.21: small bug fixes : highlighting multiple matches and regression when clearing the search box

0.2 : search box / query filtering 

0.1 : inital release
