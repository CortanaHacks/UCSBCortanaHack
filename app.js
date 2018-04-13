/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

var tableName = 'botdata';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);
var emergency;
var location;

// Create your bot with a function to receive messages from the user

var bot = new builder.UniversalBot(connector, [
    function(session){
        
            if(session.message && session.message.entities){
                var userInfo = session.message.entities.find((e) => {
                    return e.type === 'UserInfo';
                });
            
                if (userInfo) {
                    var email = userInfo['email'];
            
                    if(email && email !== ''){
                        //session.send("U Email: " + email);
                    }
                    var currentLocation = userInfo['current_location'];
            
                    if (currentLocation)
                    {
                        //Access the latitude and longitude values of the user's location.
                        var lat = currentLocation.Hub.Latitude;
                        var lon = currentLocation.Hub.Longitude;
                        location = lat + " " + lon + " " + currentLocation.Hub.Name + " " + currentLocation.Hub.Address
                        
            
                        //Do something with the user's location information.
                    }
                }
            }

        var n = session.message.text.indexOf("911");
        
        if(n > 0){
            emergency = true;
        }
        else{
            emergency = false;
        }
        
        if(emergency){
            // Emergency pathway
            session.send("Calling 911 and sendinng location: " + location);
        }
        else {
            // Normal pathway
            builder.Prompts.text(session, "What's your name?");
        }
},
    function(session,response){
        session.send(session.message.text);
    
}]);
// bot.set('storage', tableStorage);

// Add first run dialog
bot.dialog('firstRun', [
    function (session) {
        // Update versio number and start Prompts
        // - The version number needs to be updated first to prevent re-triggering 
        //   the dialog. 
        session.userData.version = 1.0; 
        builder.Prompts.text(session, "Hello, setting up ... What's your name?");
    },
    function (session, results) {
        // We'll save the users name and send them an initial greeting. All 
        // future messages from the user will be routed to the root dialog.
        session.userData.name = results.response;
        session.endDialog("Hi %s, say something to me and I'll echo it back.", session.userData.name); 
    }
]).triggerAction({
    onFindAction: function (context, callback) {
        // Trigger dialog if the users version field is less than 1.0
        // - When triggered we return a score of 1.1 to ensure the dialog is always triggered.
        var ver = context.userData.version || 0;
        var score = ver < 1.0 ? 1.1: 0.0;
        callback(null, score);
    },
    onInterrupted: function (session, dialogId, dialogArgs, next) {
        // Prevent dialog from being interrupted.
        session.send("Sorry... We need some information from you first.");
    }
});