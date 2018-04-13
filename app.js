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

// var bot = new builder.UniversalBot(connector, []);
// var inMemoryStorage = new builder.MemoryBotStorage();

var bot = new builder.UniversalBot(connector, [
    function (session) {
        // check if user has been registered
        var name = session.userData.name
        if(name) {
            // session.say(`No survey needed ${session.userData.name}!`, `No survey needed ${session.userData.name}!`);
            // session.say(`No survey needed ${session.userData.name}!`, `No survey needed ${session.userData.name}!`);
            sesson.say(`${session.userData.name}, a ${session.userData.age}! year old ${session.userData.sex}! patient is suffering from a myocardial infraction. EMS
            services is needed immediately`);

        }
        else {
            
            session.beginDialog('setupSurvey');

        }
    }
   
]).set('storage', tableStorage); // Register in-memory storage ;
//bot.set('storage', tableStorage);

// Setup survey 
bot.dialog('setupSurvey', [
    function (session) {
        session.say("Hi! I am Ella, your EMS assistant. I need to ask you a few basic questions to setup.", "Hi! I am Ella, your EMS assistant. I need to ask you a few basic questions to setup.");
        builder.Prompts.text(session, 'What is your name?', {                                    
            speak: 'What is your name?',                                               
            retrySpeak: "I'm sorry, please repeat your name",  
            inputHint: builder.InputHint.expectingInput                                              
        });
    },
    function (session, results) {
        session.userData.name = results.response;
        builder.Prompts.number(session, 'What is your age?', {                                    
            speak: 'What is your age?',                                               
            retrySpeak: "I'm sorry, please repeat your age",  
            inputHint: builder.InputHint.expectingInput                                              
        });
    },
    function (session, results) {
        session.userData.age = results.response;
        builder.Prompts.text(session, 'Are you male or female?', {                                    
            speak: 'Are you male or female?',                                               
            retrySpeak: "I'm sorry, please repeat your sex",  
            inputHint: builder.InputHint.expectingInput                                              
        });
    },
    function (session, results) {
        session.userData.sex = results.response;
        session.save();
        session.say(`Thank you ${session.userData.name}!`, `Thank you ${session.userData.name}!`);
    }

])



// bot.dialog('/', function (session) {
//     session.send('You said ' + session.message.text);
// });
