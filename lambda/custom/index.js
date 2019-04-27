/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');

const NameHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'NameIntent';
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    var fname = request.intent.slots.fname.value;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    attributes.fname = fname;
    handlerInput.attributesManager.setSessionAttributes(attributes);
    return handlerInput.responseBuilder
      .speak(GREETING + " " + fname + ". " + DIFFICULTY_MESSAGE)
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};

const DifficultyHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'DifficultyIntent';
  },
  handle(handlerInput) {
    console.log("In difficulty handler");
    const request = handlerInput.requestEnvelope.request;
    var difficulty = request.intent.slots.difficulty.value;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    attributes.difficulty = difficulty;
    handlerInput.attributesManager.setSessionAttributes(attributes);
    return handlerInput.responseBuilder
      .speak("You have chosen difficulty " + difficulty + ". Let me choose a random category for you. "+WAITING_SOUND+
      "I have chosen math."+ WAITING_SOUND2+"The question is: What is five minus three?")
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};

const AnswerHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AnswerIntent';
  },
  handle(handlerInput) {
    console.log("In answer handler");
    const request = handlerInput.requestEnvelope.request;
    var answer = request.intent.slots.answer.value;
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    var correct = false;
    console.log(answer);
    if (answer == 2 || answer == "two") {
      console.log("answer is correct");
      correct = true;
    }
    var reply = "";
    console.log("created reply");
    if (correct) {
      reply = CORRECT_ANSWER_SOUND + "You answered correctly!";
    } else {
      reply = INCORRECT_ANSWER_SOUND + "Incorrect answer!";
    }
    console.log(reply);
    return handlerInput.responseBuilder
      .speak(reply)
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest'
  },
  handle(handlerInput) {
    
    return handlerInput.responseBuilder
      .speak(GAME_SOUND1 + WELCOME_MESSAGE)
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};

const DailyGameHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && 
      request.intent.name === 'DailyGame'&&
        request.dialogState !== 'COMPLETED';
  },
  handle(handlerInput) {
    
    const request = handlerInput.requestEnvelope.request;
    const filledSlots = request.intent.slots;
    const answer = filledSlots.answerA.value;
    
    let currentQuestionCounter = 0;
    let speechOutput = questionArray[currentQuestionCounter].question;
    let correctAnswer = questionArray[currentQuestionCounter].answer;
    
    // if exists in session, we get currentQuestionCounter and previousAnswer
    let currentIntent = handlerInput.requestEnvelope.request.intent;
    const {attributesManager,responseBuilder} = handlerInput;
    const sessionAttributes = attributesManager.getSessionAttributes();
    if (sessionAttributes[currentIntent.name]) {
      currentQuestionCounter = sessionAttributes[currentIntent.name].currentQuestionCounter;
      correctAnswer =sessionAttributes[currentIntent.name].previousAnswer;
      speechOutput = questionArray[currentQuestionCounter].question;
      console.log("currentQuestionCounter" + currentQuestionCounter);
    }
    if (answer){
      if (answer.toLowerCase() === correctAnswer) {
        speechOutput = CORRECT_ANSWER;
        if (currentQuestionCounter < questionArray.length-1){
          speechOutput = speechOutput + NEXT_QUESTION_MESSAGE + questionArray[currentQuestionCounter+1].question;
          correctAnswer = questionArray[currentQuestionCounter+1].answer;
        }else{
            speechOutput = speechOutput + CONGRATS_MESSAGE;
          }
        currentQuestionCounter++;
        }
        else {
          speechOutput = INCORRECT_ANSWER +" "+ speechOutput;
        }
    }
    // Saving correctAnswer and counter into session
    let previousAnswer = correctAnswer;
    sessionAttributes[currentIntent.name] = {currentQuestionCounter,previousAnswer};
    attributesManager.setSessionAttributes(sessionAttributes);
    
    var response =  handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(speechOutput)
      .addElicitSlotDirective("answerA")
      .getResponse();
    return response;
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(HELP_MESSAGE)
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(STOP_MESSAGE)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`The session ended: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('<say-as interpret-as="interjection">ouch</say-as> there was a problem with your request')
      .reprompt('there was a problem with your request')
      .getResponse();
  },
};

const DIFFICULTY_MESSAGE = "What level of difficulty would you like? Please say easy medium or hard";
const GREETING = "Hello"
const SKILL_NAME = "STEM party";
const WELCOME_MESSAGE = " Welcome to STEM party! It is great that you want to learn more about science, tech, engineering and math. What is your name?";
const GAME_SOUND1 = "<audio src='soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_intro_01'/>";
const WAITING_SOUND2 = "<audio src='soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_neutral_response_03'/>";
const WAITING_SOUND = "<audio src='soundbank://soundlibrary/foley/amzn_sfx_clock_ticking_01'/>";
const CORRECT_ANSWER_SOUND = "<audio src='soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_tally_positive_01'/>";
const INCORRECT_ANSWER_SOUND = "<audio src='soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_tally_negative_01'/>";
const HELP_MESSAGE = "You can start your daily game, or check how you compare with your friends... ¿How can I help?";
const HELP_REPROMPT = "How can I help?";
const CORRECT_ANSWER = "Correct!";
const INCORRECT_ANSWER = "Incorrect!";
const NEXT_QUESTION_MESSAGE = "Next!";
const CONGRATS_MESSAGE = "Congratulations, the trivia has ended!";
const STOP_MESSAGE = "<say-as interpret-as='interjection'>okey dokey</say-as><s> see you later </s>";

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    AnswerHandler,
    NameHandler,
    DifficultyHandler,
    DailyGameHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();

const questionArray = [
 {"question":"What city is re:invent 2018 in?", "answer":"las vegas" },
 {"question":"How many attendees are expected in re:invent 2018?", "answer":"43000" },
 {"question":"What is the name of this session in Vegas?", "answer":"cool session" }
];