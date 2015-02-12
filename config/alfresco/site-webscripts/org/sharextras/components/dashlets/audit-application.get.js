function getUserIsSiteManager(username)
{
   // Call the repository to see if the user is a site manager or not
   var userIsSiteManager = false;
   var membership = context.properties["memberships"];
   if (!membership)
   {
      var json = remote.call("/api/sites/" + page.url.templateArgs.site + "/memberships/" + stringUtils.urlEncode(username));
      if (json.status == 200)
      {
         membership = jsonUtils.toObject(json);
      }
   }
   if (membership)
   {
      userIsSiteManager = (membership.role == "SiteManager");
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
