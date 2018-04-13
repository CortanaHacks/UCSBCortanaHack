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


var Browser = require("zombie");
var url = "http://work.krasimirtsonev.com/git/blog-posts/TestingWithZombieJS/site/";
var browser = new Browser();

describe("testing with zombie", function() {

});





// Create your bot with a function to receive messages from the user

var bot = new builder.UniversalBot(connector, [
    function(session){
        // Define adaptive card message
        var msg = new builder.Message(session)
        .addAttachment({
            contentType: "application/vnd.microsoft.card.adaptive",
            content: {
                    "type": "AdaptiveCard",
            "version": "1.0",
            "body": [],
            "actions": [
                {
                    "type": "Action.OpenUrl",
                    "title": "Location sent - call 911",
                    "url": "skype:+1234567890?call"
                }
                     ]
            }
        });



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

    
        session.send(msg);
        builder.Prompts.text(session, "What are your symptoms?");
        
},
    function(session, results){
        builder.Prompts.text(session, "What are your symptoms?");
},
    function(session, results){
        builder.Prompts.text(session, results);
}

]);
//bot.set('storage', tableStorage);
/*
bot.dialog('/', function (session) {
    session.send('You said ' + session.message.text);
});
*/