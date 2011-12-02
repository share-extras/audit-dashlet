function main()
{

    // get the live list from the repo of currently registered audit applications
    // requires to be logged in as an admin user
    var uri = "/api/audit/control";
    var connector = remote.connect("alfresco");
    var result = connector.get(uri);

    if (result.status == status.STATUS_OK)
    {
	var auditcontrol = eval("(" + result.response + ")");
	model.auditcontrol = auditcontrol;
    }
    else
    {
	status.setCode(result.status, "Error during remote call. " + "Status: " + result.status + ", Response: " + result.response);
	status.redirect = true;
    }

}
main();
