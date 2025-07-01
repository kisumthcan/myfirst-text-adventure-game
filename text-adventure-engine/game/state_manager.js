function initializePlayerState(character) {
  return {
    points: { ...character.initial_state.points },
    attributes: [...character.initial_state.attributes],
    characterId: character.id
  };
}

function updatePlayerState(playerState, outcome) {
  if (outcome.points_change) {
    Object.keys(outcome.points_change).forEach(pointType => {
      const change = outcome.points_change[pointType];
      if (playerState.points[pointType] !== undefined) {
        playerState.points[pointType] += change;
        playerState.points[pointType] = Math.max(0, playerState.points[pointType]);
      }
    });
  }

  if (outcome.attributes_add && outcome.attributes_add.length > 0) {
    outcome.attributes_add.forEach(attr => {
      if (!playerState.attributes.includes(attr)) {
        playerState.attributes.push(attr);
      }
    });
  }

  if (outcome.attributes_remove && outcome.attributes_remove.length > 0) {
    outcome.attributes_remove.forEach(attr => {
      const index = playerState.attributes.indexOf(attr);
      if (index > -1) {
        playerState.attributes.splice(index, 1);
      }
    });
  }
}

function checkPointsCondition(playerState, pointsCondition) {
  if (!pointsCondition || Object.keys(pointsCondition).length === 0) {
    return true;
  }

  return Object.keys(pointsCondition).every(pointType => {
    const requiredValue = pointsCondition[pointType];
    const currentValue = playerState.points[pointType] || 0;
    return currentValue >= requiredValue;
  });
}

function checkAttributesCondition(playerState, attributesCondition) {
  if (!attributesCondition || attributesCondition.length === 0) {
    return true;
  }

  return attributesCondition.every(attr => {
    if (attr.startsWith('!')) {
      const negatedAttr = attr.substring(1);
      return !playerState.attributes.includes(negatedAttr);
    } else {
      return playerState.attributes.includes(attr);
    }
  });
}

function checkConditions(playerState, conditions) {
  if (!conditions) {
    return true;
  }

  const pointsMatch = checkPointsCondition(playerState, conditions.points);
  const attributesMatch = checkAttributesCondition(playerState, conditions.attributes);

  return pointsMatch && attributesMatch;
}

function displayPlayerState(playerState) {
  console.log('\n--- 当前状态 ---');
  console.log('点数:', Object.entries(playerState.points)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', '));
  
  if (playerState.attributes.length > 0) {
    console.log('属性:', playerState.attributes.join(', '));
  }
  console.log('---------------');
}

function displayChoiceImpact(outcome) {
  const impacts = [];
  
  if (outcome.points_change && Object.keys(outcome.points_change).length > 0) {
    Object.entries(outcome.points_change).forEach(([pointType, change]) => {
      if (change > 0) {
        impacts.push(`${pointType} +${change}`);
      } else if (change < 0) {
        impacts.push(`${pointType} ${change}`);
      }
    });
  }
  
  if (outcome.attributes_add && outcome.attributes_add.length > 0) {
    outcome.attributes_add.forEach(attr => {
      impacts.push(`获得 [${attr}]`);
    });
  }
  
  if (outcome.attributes_remove && outcome.attributes_remove.length > 0) {
    outcome.attributes_remove.forEach(attr => {
      impacts.push(`失去 [${attr}]`);
    });
  }
  
  if (impacts.length > 0) {
    console.log(`\n📊 选择影响: ${impacts.join(', ')}`);
  }
}

function generateChoiceReasonText(playerState, conditions) {
  const reasons = [];
  
  if (conditions && conditions.points) {
    Object.entries(conditions.points).forEach(([pointType, required]) => {
      const current = playerState.points[pointType] || 0;
      if (current < required) {
        reasons.push(`需要 ${pointType} ≥ ${required}，当前 ${current}`);
      }
    });
  }
  
  if (conditions && conditions.attributes) {
    conditions.attributes.forEach(attr => {
      if (attr.startsWith('!')) {
        const negatedAttr = attr.substring(1);
        if (playerState.attributes.includes(negatedAttr)) {
          reasons.push(`不能拥有 [${negatedAttr}]`);
        }
      } else {
        if (!playerState.attributes.includes(attr)) {
          reasons.push(`需要 [${attr}]`);
        }
      }
    });
  }
  
  return reasons.length > 0 ? reasons.join('; ') : '';
}

module.exports = {
  initializePlayerState,
  updatePlayerState,
  checkConditions,
  displayPlayerState,
  displayChoiceImpact,
  generateChoiceReasonText
};