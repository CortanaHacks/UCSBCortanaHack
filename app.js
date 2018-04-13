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
        else{emergency = false;}
        if(emergency){
        session.send("Calling 911 and sendinng location: " + location);}
        builder.Prompts.text(session, "What's your name?");
},
    function(session,response){
        session.send(session.message.text);
    
}]);
//bot.set('storage', tableStorage);
/*
bot.dialog('/', function (session) {
    session.send('You said ' + session.message.text);
});
*/