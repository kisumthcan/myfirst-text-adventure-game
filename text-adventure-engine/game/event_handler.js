const stateManager = require('./state_manager');

function isEventInTurnRange(event, currentTurn) {
  if (!event.turn_range || event.turn_range.length !== 2) {
    return true;
  }
  
  const [startTurn, endTurn] = event.turn_range;
  return currentTurn >= startTurn && currentTurn <= endTurn;
}

function filterAvailableEvents(allEvents, currentTurn, playerState) {
  return allEvents.filter(event => {
    if (event.type === 'ending') {
      return false;
    }
    
    if (!isEventInTurnRange(event, currentTurn)) {
      return false;
    }
    
    return stateManager.checkConditions(playerState, event.conditions);
  });
}

function selectEventByPriority(availableEvents) {
  if (availableEvents.length === 0) {
    return null;
  }
  
  const maxPriority = Math.max(...availableEvents.map(event => 
    event.conditions?.priority || 0
  ));
  
  const highestPriorityEvents = availableEvents.filter(event => 
    (event.conditions?.priority || 0) === maxPriority
  );
  
  const randomIndex = Math.floor(Math.random() * highestPriorityEvents.length);
  return highestPriorityEvents[randomIndex];
}

function filterAvailableChoices(choices, playerState) {
  if (!choices || choices.length === 0) {
    return [];
  }
  
  return choices.filter(choice => {
    if (!choice.conditions) {
      return true;
    }
    
    return stateManager.checkConditions(playerState, choice.conditions);
  });
}

function checkEndings(allEvents, playerState) {
  const endings = allEvents.filter(event => event.type === 'ending');
  
  for (const ending of endings) {
    if (stateManager.checkConditions(playerState, ending.conditions)) {
      return ending;
    }
  }
  
  return null;
}

module.exports = {
  filterAvailableEvents,
  selectEventByPriority,
  filterAvailableChoices,
  checkEndings
};