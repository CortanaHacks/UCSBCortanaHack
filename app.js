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
    
    // check if user has been registered
    function (session, next) {
        var name = session.userData.name
        if(!name) {
             // initial setup
             session.beginDialog('setup');

            // session.say(`Hi ${session.userData.name}! How are you feeling today?`, `Hi ${session.userData.name}! How are you feeling today?`);
            // session.beginDialog('vitals');
            // standard user flow
            // session.say(`No survey needed ${session.userData.name}!`, `No survey needed ${session.userData.name}!`);
            // session.say(`${session.userData.name}, a ${session.userData.age} year old ${session.userData.sex} patient is suffering from a myocardial infraction. EMS
            // services are needed immediately`, `${session.userData.name}, a ${session.userData.age} year old ${session.userData.sex} patient is suffering from a myocardial infraction. EMS
            // services are needed immediately`);
        }

        next();
    },
    function (session, results)
    {
        session.say(`Hi ${session.userData.name}! How are you feeling today?`, `Hi ${session.userData.name}! How are you feeling today?`);
        session.beginDialog('vitals');

    },
    function (session, results)
    {
        session.beginDialog('vitals_summary', results.response);

    }
   
]).set('storage', tableStorage); // Register in-memory storage ;
//bot.set('storage', tableStorage);

// Setup survey 
bot.dialog('setup', [
    function (session) {
        session.say("Hi! I am Ella, your Emergency Medical Services assistant. I need to ask you a few basic questions to setup.", "Hi! I am Ella, your Emergency Medical Services assistant. I need to ask you a few basic questions to setup.");
        builder.Prompts.text(session, 'What is your name?', {                                    
            speak: 'What is your name?',                                               
            retrySpeak: "I'm sorry, please repeat your name",  
            inputHint: builder.InputHint.expectingInput                                              
        });
    },
    function (session, results) {
        session.userData.name = results.response;
        builder.Prompts.number(session, 'What is your age?', {                                    
            speak: 'Great! What is your age?',                                               
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
        session.say(`Thank you ${session.userData.name}!`, `Thank you ${session.userData.name}!`);
    }

])

// vitals
bot.dialog('vitals', [
    function (session) {
        session.say("I am going to quickly take your vitals", "I am going to quickly take your vitals");
        builder.Prompts.number(session, 'What is heart rate?', {                                    
            speak: 'Firstly, what is your heart rate? Say zero if you do not know',                                               
            retrySpeak: "I'm sorry, please repeat your heart rate",  
            inputHint: builder.InputHint.expectingInput                                              
        });
    },
    function (session, results) {
        // initialize dictionary 
        session.dialogData.vitals = {};
        session.dialogData.vitals.hr = results.response;
        builder.Prompts.number(session, 'What is your systolic blood pressure?', {                                    
            speak: 'Great, what is your systolic blood pressure? Say zero if you do not know',                                               
            retrySpeak: "I'm sorry, please repeat your systolic blood pressure",  
            inputHint: builder.InputHint.expectingInput                                              
        });
    },
    function (session, results) {
        session.dialogData.vitals.sp = results.response;
        builder.Prompts.number(session, 'What is your diastolic blood pressure?', {                                    
            speak: 'What is your diastolic blood pressure? Say zero if you do not know',                                               
            retrySpeak: "I'm sorry, please repeat your diastolic blood pressure",  
            inputHint: builder.InputHint.expectingInput                                              
        });
    },
    function (session, results) {
        session.dialogData.vitals.dp = results.response;
        builder.Prompts.number(session, 'What is your respiratory rate?', {                                    
            speak: 'What is your respiratory rate? Say zero if you do not know',                                               
            retrySpeak: "I'm sorry, please repeat your respiratory rate",  
            inputHint: builder.InputHint.expectingInput                                              
        });
    },
    function (session, results) {
        session.dialogData.vitals.rr = results.response;
        builder.Prompts.number(session, 'What is your body temperature?', {                                    
            speak: 'What is your body temperature? Say zero if you do not know',                                               
            retrySpeak: "I'm sorry, please repeat your body temperature",  
            inputHint: builder.InputHint.expectingInput                                              
        });
    },
    function (session, results) {
        session.userData.vitals.bt = results.response;
        // session.save();
        session.say(`Thank you ${session.userData.name}!`, `Thank you ${session.userData.name}!`);
        session.endDialogWithResult({ response: session.dialogData.vitals });
    }

])

// summarizes vitals
bot.dialog('vitals_summary', [
    function (session, args) {
        var summary = `This an automated message. Patient is a ${session.userData.age} year old ${session.userData.sex} suffering from a medical emergency.`
        
        // heart rate
        summary += " His heart rate is ";
        if(args.hr >= 160)
        {
            summary += "tachycardic. ";
        }
        else if(args.hr > 100 && args.hr < 160)
        {
            summary += "slightly tachycardic. ";

        }
        else if(args.hr >= 60 && args.hr < 101)
        {
            summary += "normal. ";
        }
        else if(args.hr > 40 && args.hr < 60)
        {
            summary += "slightly bradycardic. ";

        }
        else if(args.hr > 20 && args.hr < 41)
        {
            summary += "slightly bradycardic. ";

        }
        else 
        {
            summary += "unknown. ";

        }

        // blood pressure
        summary += " He ";
        if(args.sp >= 140 || args.dp >= 90)
        {
            summary += "is hypertensive ";
        }
        else if(args.sp > 90 && args.sp < 140)
        {
            summary += "has normal blood pressure ";

        }
        else if(args.sp >= 60 && args.sp < 90)
        {
            summary += "is hypotensive ";
        }
        else if(args.sp > 0 && args.sp < 60)
        {
            summary += "is extremely hypotensive ";

        }
        else 
        {
            summary += "has unknown blood pressure ";

        }

        // respiratory rate
        summary += " and he ";
        if(args.rr >= 32)
        {
            summary += "has a high respiratory rate and may be in respiratory distress. ";
        }
        else if(args.rr > 8 && args.rr < 32)
        {
            summary += "has a normal respiratory rate. ";

        }
        else if(args.rr > 0 && args.rr < 8)
        {
            summary += "has a low respiratory rate and may be in respiratory distress. ";
        }
        else 
        {
            summary += "has unknown respiratory rate. ";

        }

        // body temperature
        summary += " He ";
        if(args.bt >= 99)
        {
            summary += "also may be febrile based on his body temperature. ";
        }
        else if(args.bt > 98 && args.bt < 99)
        {
            summary += "also has a normal body temperature. ";

        }
        else if(args.bt > 0 && args.bt < 98)
        {
            summary += "also has a low body temperature. ";
        }
        else 
        {
            summary += "has unknown body temperature. ";

        }

        session.say(summary, summary).endDialog();
    }
])

// bot.dialog('/', function (session) {
//     session.send('You said ' + session.message.text);
// });
