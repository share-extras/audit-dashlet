function getUserIsSiteManager(username)
{
   // Call the repository to see if the user is a site manager or not
   var userIsSiteManager = false;
   var obj = context.properties["memberships"];
   if (!obj)
   {
      var json = remote.call("/api/sites/" + page.url.templateArgs.site + "/memberships/" + stringUtils.urlEncode(username));
      if (json.status == 200)
      {
         obj = eval('(' + json + ')');
      }
   }
   if (obj)
   {
      userIsSiteManager = (obj.role == "SiteManager");
   }
   return userIsSiteManager;
}
function getUserHasConfigPermission(username)
{
   if (page.url.templateArgs.site != null) // Site or user dashboard?
   {
      return getUserIsSiteManager(username);
   }
   else // user dashboard
   {
      return true;
   }
}
function main()
{
    model.userHasConfigPermission = getUserHasConfigPermission(user.name);
    model.userIsAdmin = user.isAdmin;
    
}
main();
