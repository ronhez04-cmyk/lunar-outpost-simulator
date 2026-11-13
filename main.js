import './style.css';

let game;
let currentEmergency = null;

const initialState = () => ({
  day: 1,
  oxygen: 100,
  water: 100,
  food: 100,
  power: 80,
  health: 100,
  greenhouse: 1,
  solarLevel: 1,
  radiationShielding: 1,
  hydroponicBoost: false,
  emergenciesHandled: 0,
  decisionsLog: [],
  finished: false,
  won: false,
  log: 'Welcome, Commander. All life-support systems are online. Survive 30 days on the Moon.'
});

const emergencies = [
  {
    name: '🌪️ LUNAR DUST STORM',
    description: 'Electrostatic lunar regolith dust is coating your solar arrays and reducing power generation.',
    science: 'NASA Science Note: Lunar dust is sharp and electrostatically charged, clinging to spacesuits, seals, and solar panels and reducing photovoltaic efficiency.',
    choices: [
      {
        text: 'Activate shelter & dust wipers (-10 Power, +5 Health)',
        effect: { power: -10, health: 5 },
        feedback: 'Dust wipers cleared the arrays and protected crew seals.'
      },
      {
        text: 'Continue normal operations (-15 Power, -10 Health)',
        effect: { power: -15, health: -10 },
        feedback: 'Dust buildup reduced solar output and strained air filters.'
      }
    ]
  },
  {
    name: '💧 WATER RECYCLING LEAK',
    description: 'A pressure drop was detected in the Environmental Control and Life Support System (ECLSS) water loop.',
    science: 'NASA Science Note: On the ISS and future lunar bases, over 90% of water must be recycled because launching water from Earth is extremely expensive.',
    choices: [
      {
        text: 'Seal & repair loop (-10 Power, +15 Water)',
        effect: { power: -10, water: 15 },
        feedback: 'Water loop sealed! Crew hydration and crop irrigation remain stable.'
      },
      {
        text: 'Ration remaining water (-5 Water, -8 Health)',
        effect: { water: -5, health: -8 },
        feedback: 'Rationing saved power, but dehydration lowered crew performance.'
      }
    ]
  },
  {
    name: '🫁 OXYGEN GENERATOR FAULT',
    description: 'The electrolysis unit splitting water into breathable oxygen has stalled.',
    science: 'NASA Science Note: Spacecraft produce oxygen via electrolysis (splitting H₂O into O₂ and H₂) alongside carbon dioxide scrubbers.',
    choices: [
      {
        text: 'Reboot electrolysis (-15 Power, -5 Water, +22 Oxygen)',
        effect: { power: -15, water: -5, oxygen: 22 },
        feedback: 'Electrolysis restored! Water reserves were converted into fresh oxygen.'
      },
      {
        text: 'Use backup O₂ tanks (+10 Oxygen, -5 Food)',
        effect: { oxygen: 10, food: -5 },
        feedback: 'Emergency tanks stabilized air pressure while crew paused greenhouse work.'
      }
    ]
  },
  {
    name: '⚡ SOLAR ARRAY MICROMETEORITE HIT',
    description: 'A tiny micrometeorite damaged a solar wing, cutting daily electricity generation.',
    science: 'NASA Science Note: Without an atmosphere to burn up space debris, the lunar surface is constantly struck by high-speed micrometeorites.',
    choices: [
      {
        text: 'Conduct EVA repair (+20 Power, -8 Water, -5 Health)',
        effect: { power: 20, water: -8, health: -5 },
        feedback: 'Spacewalk successful! Power output is back to normal.'
      },
      {
        text: 'Switch to battery conservation (+5 Power, -8 Oxygen)',
        effect: { power: 5, oxygen: -8 },
        feedback: 'Low-power mode saved electricity but slowed O₂ scrubbing.'
      }
    ]
  },
  {
    name: '☢️ SOLAR PARTICLE RADIATION ALERT',
    description: 'A solar flare is sending high-energy radiation toward the Moon!',
    science: 'NASA Science Note: Unlike Earth, the Moon has no global magnetic field or thick atmosphere, exposing astronauts to galactic cosmic rays and solar storms.',
    choices: [
      {
        text: 'Retreat to shielded core (-12 Power, +8 Health)',
        effect: { power: -12, health: 8 },
        feedback: 'Regolith-shielded habitat walls blocked dangerous solar radiation.'
      },
      {
        text: 'Continue surface ops (-22 Health, mitigated by Shielding)',
        effect: { health: -22 },
        feedback: 'Crew took radiation exposure; upgraded shielding reduced the impact.'
      }
    ]
  }
];

function startMission() {
  game = initialState();
  currentEmergency = null;
  showDashboard();
}

function renderWelcome() {
  document.querySelector('#app').innerHTML = `
    <main class="welcome">
      <div class="stars">✦ ✧ ✦ ✧ ✦</div>
      <p class="tag">2026 NASA SPACE APPS CHALLENGE • JUNIOR ASTRONAUT MISSION TRAINER</p>
      <h1>LUNAR OUTPOST<br><span>SIMULATOR</span></h1>
      <p class="subtitle">Manage life support, solar power, food production, and radiation shielding to keep your lunar crew alive for 30 days.</p>

      <section class="mission-card">
        <h2>🌕 LUNAR OUTPOST SIMULATION</h2>
        <p>Step into the role of Lunar Base Commander for Team <strong>NOVA NEXUS 26</strong>. Balance real space-engineering trade-offs in a resource-limited lunar environment.</p>
        <div class="nav-buttons">
          <button id="startBtn">🚀 START MISSION</button>
          <button class="secondary-btn" id="howToBtn">📘 HOW TO PLAY</button>
          <button class="secondary-btn" id="aboutBtn">🛰️ ABOUT & NASA DATA</button>
        </div>
      </section>

      <p class="footer">MISSION CONTROL • TEAM NOVA NEXUS 26</p>
    </main>
  `;

  document.querySelector('#startBtn').addEventListener('click', startMission);
  document.querySelector('#howToBtn').addEventListener('click', renderHowToPlay);
  document.querySelector('#aboutBtn').addEventListener('click', renderAbout);
}

function renderHowToPlay() {
  document.querySelector('#app').innerHTML = `
    <main class="dashboard">
      <p class="tag">JUNIOR ASTRONAUT TRAINING MANUAL</p>
      <h1>📘 HOW TO PLAY</h1>
      <p class="subtitle">Learn how lunar outpost systems work together before starting your 30-day mission.</p>

      <section class="mission-card left-align">
        <h2>🎯 Mission Objective</h2>
        <p>Keep your crew alive from <strong>Day 1 to Day 30</strong>. If Oxygen, Water, Food, or Crew Health hits <strong>0%</strong>, the mission fails.</p>

        <h2>📊 Daily Resource Cycle</h2>
        <ul class="info-list">
          <li><strong>🫁 Oxygen (-3/day):</strong> Consumed continuously by the crew for breathing.</li>
          <li><strong>💧 Water (-3/day):</strong> Used for crew hydration, oxygen electrolysis, and greenhouse crops.</li>
          <li><strong>🍎 Food (-4/day):</strong> Consumed daily; offset by your Lunar Greenhouse harvest.</li>
          <li><strong>⚡ Power (Net + or -):</strong> Generated by Solar Arrays (+4 per level/day) and spent on life support (-5/day), hydroponics, and upgrades.</li>
          <li><strong>❤️ Crew Health:</strong> Drops if any vital resource falls into the critical danger zone (&le; 20%).</li>
        </ul>

        <h2>🛠️ Base Operations & Trade-Offs</h2>
        <ul class="info-list">
          <li><strong>🌱 Upgrade Greenhouse (20 Power):</strong> Increases daily food yield (+2 Food/day per level).</li>
          <li><strong>💧 Hydroponic Boost (Toggle):</strong> Uses extra Water (-2/day) and Power (-2/day) to boost Food production (+3/day).</li>
          <li><strong>☀️ Upgrade Solar Arrays (20 Power):</strong> Increases daily electricity generation (+4 Power/day per level).</li>
          <li><strong>☢️ Upgrade Radiation Shielding (25 Power):</strong> Protects crew health during Solar Radiation Alerts.</li>
        </ul>

        <h2>🚨 Handling Emergencies</h2>
        <p>Every 3 days, a lunar hazard occurs. Read the science note, weigh the resource cost, and choose a response before advancing to the next day.</p>

        <div class="nav-buttons">
          <button id="startFromTutorialBtn">🚀 START MISSION</button>
          <button class="secondary-btn" id="backHomeBtn">⬅️ BACK TO HOME</button>
        </div>
      </section>
    </main>
  `;

  document.querySelector('#startFromTutorialBtn').addEventListener('click', startMission);
  document.querySelector('#backHomeBtn').addEventListener('click', renderWelcome);
}

function renderAbout() {
  document.querySelector('#app').innerHTML = `
    <main class="dashboard">
      <p class="tag">2026 NASA SPACE APPS CHALLENGE • PROJECT DOCUMENTATION</p>
      <h1>🛰️ ABOUT THE PROJECT</h1>
      <p class="subtitle">Team NOVA NEXUS 26 • Junior Astronaut Mission Trainer</p>

      <section class="mission-card left-align">
        <h2>1. What Real-World Problem Are We Addressing?</h2>
        <p>Sustaining human life on the Moon requires managing scarce oxygen, water, food, and electrical power in an extreme environment without a breathable atmosphere or magnetic radiation shield. Students often struggle to visualize how engineers balance competing survival systems. This game turns those engineering trade-offs into hands-on decisions.</p>

        <h2>2. Which Official Challenge Does This Answer?</h2>
        <p>This project addresses the <strong>2026 NASA Space Apps Challenge: Build a Junior Astronaut Mission Trainer</strong>, helping learners explore lunar life support, radiation protection, power management, food production, and emergency response.</p>

        <h2>3. What NASA & Partner Open Resources Are Used?</h2>
        <p>Our educational explanations and game mechanics are informed by publicly available NASA STEM and lunar exploration resources (not live telemetry APIs):</p>
        <ul class="info-list">
          <li><a href="https://science.nasa.gov/moon/" target="_blank" rel="noopener">NASA Moon Science</a> — Supports lunar environment facts (regolith dust, lack of atmosphere/magnetic field, micrometeorites).</li>
          <li><a href="https://www.nasa.gov/moontomars/" target="_blank" rel="noopener">NASA Moon to Mars Architecture</a> — Supports surface habitat, solar power, and radiation shielding concepts.</li>
          <li><a href="https://www.nasa.gov/humans-in-space/" target="_blank" rel="noopener">NASA Humans in Space (ECLSS & Space Farming)</a> — Supports closed-loop water recycling, oxygen generation, and controlled-environment food production.</li>
        </ul>

        <h2>4. How Does Our Solution Address the Problem?</h2>
        <p>By running a 30-day lunar outpost, students directly experience cause and effect—such as spending water and power to grow food or reinforcing radiation shielding before solar storms—reinforced with concise NASA science notes after every event.</p>

        <p class="disclaimer"><strong>Educational Disclaimer:</strong> Resource rates and damage numbers are simplified educational approximations designed for classroom playability, not an official NASA engineering simulation. This project is an independent student submission and is not officially endorsed by NASA.</p>

        <div class="nav-buttons">
          <button id="startFromAboutBtn">🚀 LAUNCH GAME</button>
          <button class="secondary-btn" id="backFromAboutBtn">⬅️ BACK TO HOME</button>
        </div>
      </section>
    </main>
  `;

  document.querySelector('#startFromAboutBtn').addEventListener('click', startMission);
  document.querySelector('#backFromAboutBtn').addEventListener('click', renderWelcome);
}

function clampResources() {
  ['oxygen', 'water', 'food', 'power', 'health'].forEach(key => {
    game[key] = Math.max(0, Math.min(100, game[key]));
  });
}

function getDailyNetSummary() {
  const solarGen = game.solarLevel * 4;
  const powerUse = 5 + (game.hydroponicBoost ? 2 : 0);
  const netPower = solarGen - powerUse;

  const foodProd = (game.greenhouse * 2) + (game.hydroponicBoost ? 3 : 0);
  const netFood = foodProd - 4;

  const netWater = -3 - (game.hydroponicBoost ? 2 : 0);

  return {
    netPower,
    netFood,
    netWater,
    netOxygen: -3
  };
}

function showDashboard(message = game.log) {
  game.log = message;
  const net = getDailyNetSummary();
  const fmt = (n) => (n >= 0 ? `+${n}/day` : `${n}/day`);

  document.querySelector('#app').innerHTML = `
    <main class="dashboard">
      <p class="tag">NOVA NEXUS 26 • LUNAR MISSION CONTROL</p>
      <h1>🌕 LUNAR OUTPOST SIMULATOR</h1>

      <section class="mission-card day-card">
        <p class="small-label">MISSION TIMELINE</p>
        <h2>DAY ${game.day} <span>/ 30</span></h2>
        <div class="progress-track">
          <div class="progress-fill" style="width:${(game.day / 30) * 100}%"></div>
        </div>
      </section>

      <h2 class="section-title">📊 LIFE SUPPORT & RESOURCE TELEMETRY</h2>
      <section class="resources">
        ${resourceCard('🫁', 'Oxygen', game.oxygen, `${fmt(net.netOxygen)} • Crew respiration`)}
        ${resourceCard('💧', 'Water', game.water, `${fmt(net.netWater)} • Hydration & crops`)}
        ${resourceCard('🍎', 'Food', game.food, `${fmt(net.netFood)} • Crew nutrition`)}
        ${resourceCard('⚡', 'Power', game.power, `${fmt(net.netPower)} • Solar vs. systems`)}
        ${resourceCard('❤️', 'Crew Health', game.health, 'Drops if resources ≤ 20%')}
      </section>

      ${currentEmergency ? `
        <section class="mission-card emergency-card">
          <p class="small-label">🚨 ACTIVE EMERGENCY ALERT — ACTION REQUIRED</p>
          <h2>${currentEmergency.name}</h2>
          <p>${currentEmergency.description}</p>
          <div class="science-box">${currentEmergency.science}</div>
          <div class="choice-buttons">
            ${currentEmergency.choices.map((choice, index) => `
              <button class="choice-btn" data-choice="${index}">
                ${choice.text}
              </button>
            `).join('')}
          </div>
        </section>
      ` : ''}

      <h2 class="section-title">🛠️ BASE SYSTEMS & RESOURCE ALLOCATION</h2>
      <section class="mission-card">
        <div class="upgrade-row">
          <div>
            <h3>🌱 Lunar Greenhouse (Level ${game.greenhouse})</h3>
            <p>Produces +${game.greenhouse * 2} Food/day. Higher levels increase sustainable crop yield.</p>
          </div>
          <button id="greenhouseBtn" ${game.finished || currentEmergency ? 'disabled' : ''}>
            UPGRADE • 20 ⚡
          </button>
        </div>

        <div class="upgrade-row">
          <div>
            <h3>💦 Hydroponic Water Boost (${game.hydroponicBoost ? 'ACTIVE' : 'OFF'})</h3>
            <p>Allocates extra Water (-2/day) & Power (-2/day) to grow +3 extra Food/day.</p>
          </div>
          <button id="hydroBtn" class="${game.hydroponicBoost ? 'active-toggle' : 'secondary-btn'}" ${game.finished || currentEmergency ? 'disabled' : ''}>
            ${game.hydroponicBoost ? '✅ BOOST ON' : 'ACTIVATE BOOST'}
          </button>
        </div>

        <div class="upgrade-row">
          <div>
            <h3>☀️ Solar Power Arrays (Level ${game.solarLevel})</h3>
            <p>Generates +${game.solarLevel * 4} Power/day to run life support and habitat systems.</p>
          </div>
          <button id="solarBtn" ${game.finished || currentEmergency ? 'disabled' : ''}>
            EXPAND ARRAY • 20 ⚡
          </button>
        </div>

        <div class="upgrade-row">
          <div>
            <h3>☢️ Radiation Shielding (Level ${game.radiationShielding} / 3)</h3>
            <p>Regolith & water-wall barrier protecting crew from solar storms and cosmic rays.</p>
          </div>
          <button id="shieldBtn" ${game.finished || currentEmergency || game.radiationShielding >= 3 ? 'disabled' : ''}>
            ${game.radiationShielding >= 3 ? 'MAX SHIELDING' : 'REINFORCE • 25 ⚡'}
          </button>
        </div>
      </section>

      <section class="mission-card">
        <h2>📡 COMMANDER'S LOG</h2>
        <p>${game.log}</p>
        <p class="small-label">EMERGENCIES RESOLVED: ${game.emergenciesHandled}</p>
      </section>

      <div class="controls">
        <button id="advanceBtn" ${game.finished || currentEmergency ? 'disabled' : ''}>
          ⏩ ADVANCE TO DAY ${Math.min(30, game.day + 1)}
        </button>
        <button class="secondary-btn" id="restartBtn">🔄 RESTART</button>
        <button class="secondary-btn" id="homeBtn">🏠 HOME</button>
      </div>

      <p class="footer">MISSION CONTROL • NOVA NEXUS 26 • 2026 NASA SPACE APPS</p>
    </main>
  `;

  document.querySelector('#advanceBtn').addEventListener('click', advanceDay);
  document.querySelector('#restartBtn').addEventListener('click', startMission);
  document.querySelector('#homeBtn').addEventListener('click', renderWelcome);
  document.querySelector('#greenhouseBtn').addEventListener('click', upgradeGreenhouse);
  document.querySelector('#hydroBtn').addEventListener('click', toggleHydroponics);
  document.querySelector('#solarBtn').addEventListener('click', upgradeSolar);
  document.querySelector('#shieldBtn').addEventListener('click', upgradeShield);

  document.querySelectorAll('.choice-btn').forEach(button => {
    button.addEventListener('click', () => {
      chooseEmergency(Number(button.dataset.choice));
    });
  });
}

function resourceCard(icon, name, value, note) {
  const status = value <= 20 ? 'low' : value <= 45 ? 'medium' : 'good';

  return `
    <div class="resource ${status}">
      <span class="resource-icon">${icon}</span>
      <span>${name}</span>
      <strong>${value}%</strong>
      <div class="resource-track">
        <div class="resource-fill" style="width:${value}%"></div>
      </div>
      <small>${note}</small>
    </div>
  `;
}

function advanceDay() {
  if (game.finished || currentEmergency) return;

  game.day++;

  const net = getDailyNetSummary();
  game.oxygen += net.netOxygen;
  game.water += net.netWater;
  game.food += net.netFood;
  game.power += net.netPower;

  let message = `Day ${game.day} report: Solar arrays generated +${game.solarLevel * 4} power; greenhouse produced +${(game.greenhouse * 2) + (game.hydroponicBoost ? 3 : 0)} food.`;

  if (game.power <= 0) {
    game.oxygen -= 4;
    game.health -= 8;
    message = '⚠️ Power depleted! Life-support scrubbers slowed, reducing Oxygen and Crew Health.';
  } else if (game.oxygen <= 20 || game.water <= 20 || game.food <= 20) {
    game.health -= 10;
    message = '⚠️ Critical Warning! Low life-support supplies are harming Crew Health.';
  } else if (game.oxygen > 60 && game.water > 60 && game.food > 60 && game.health < 100) {
    game.health += 2;
  }

  clampResources();

  if (game.health <= 0 || game.oxygen <= 0 || game.water <= 0 || game.food <= 0) {
    endMission(false);
    return;
  }

  if (game.day >= 30) {
    endMission(true);
    return;
  }

  if (game.day % 3 === 0) {
    const eventIndex = ((game.day / 3) - 1) % emergencies.length;
    currentEmergency = emergencies[eventIndex];
    message = `🚨 Day ${game.day} Alert: ${currentEmergency.name} requires your command decision!`;
  }

  showDashboard(message);
}

function chooseEmergency(index) {
  if (!currentEmergency || game.finished) return;

  const choice = currentEmergency.choices[index];
  if (!choice) return;

  Object.entries(choice.effect).forEach(([resource, amount]) => {
    game[resource] += amount;
  });

  if (currentEmergency.name === '☢️ SOLAR PARTICLE RADIATION ALERT' && index === 1) {
    const shieldBonus = game.radiationShielding * 5;
    game.health += shieldBonus;
  }

  const resolvedName = currentEmergency.name;
  game.decisionsLog.push(`Day ${game.day}: ${resolvedName} → ${choice.text.split('(')[0].trim()}`);
  currentEmergency = null;
  game.emergenciesHandled++;

  clampResources();

  if (game.health <= 0 || game.oxygen <= 0 || game.water <= 0 || game.food <= 0) {
    endMission(false);
    return;
  }

  showDashboard(`✅ ${resolvedName} resolved: ${choice.feedback}`);
}

function upgradeGreenhouse() {
  if (game.finished || currentEmergency) return;
  if (game.power < 20) {
    showDashboard('⚠️ Insufficient power (need 20%) to expand the Lunar Greenhouse.');
    return;
  }
  game.power -= 20;
  game.greenhouse++;
  showDashboard(`🌱 Greenhouse upgraded to Level ${game.greenhouse}! Daily food production increased.`);
}

function toggleHydroponics() {
  if (game.finished || currentEmergency) return;
  game.hydroponicBoost = !game.hydroponicBoost;
  showDashboard(
    game.hydroponicBoost
      ? '💦 Hydroponic Water Boost activated: +3 Food/day in exchange for -2 Water/day and -2 Power/day.'
      : '💦 Hydroponic Water Boost turned off to conserve water and electricity.'
  );
}

function upgradeSolar() {
  if (game.finished || currentEmergency) return;
  if (game.power < 20) {
    showDashboard('⚠️ Insufficient power (need 20%) to deploy additional solar panels.');
    return;
  }
  game.power -= 20;
  game.solarLevel++;
  showDashboard(`☀️ Solar Arrays expanded to Level ${game.solarLevel}! Daily power generation increased.`);
}

function upgradeShield() {
  if (game.finished || currentEmergency) return;
  if (game.radiationShielding >= 3) {
    showDashboard('☢️ Radiation shielding is already at maximum capacity (Level 3).');
    return;
  }
  if (game.power < 25) {
    showDashboard('⚠️ Insufficient power (need 25%) to reinforce radiation shielding.');
    return;
  }
  game.power -= 25;
  game.radiationShielding++;
  showDashboard(`☢️ Radiation Shielding reinforced to Level ${game.radiationShielding}!`);
}

function endMission(success) {
  game.finished = true;
  game.won = success;
  currentEmergency = null;
  clampResources();

  document.querySelector('#app').innerHTML = `
    <main class="welcome">
      <div class="stars">✦ ✧ ✦ ✧ ✦</div>
      <p class="tag">DEBRIEFING • TEAM NOVA NEXUS 26</p>
      <h1>${success ? '🏆 MISSION ACCOMPLISHED' : '🚨 MISSION FAILED'}</h1>
      <p class="subtitle">
        ${success
          ? 'Outstanding leadership, Commander! Your crew survived all 30 days on the lunar surface.'
          : 'Critical life-support failure ended the mission early. Review your telemetry and try again!'}
      </p>

      <section class="mission-card left-align">
        <h2>📋 FINAL MISSION TELEMETRY</h2>
        <ul class="info-list">
          <li><strong>Days Survived:</strong> ${game.day} / 30</li>
          <li><strong>Final Resources:</strong> 🫁 Oxygen ${game.oxygen}% | 💧 Water ${game.water}% | 🍎 Food ${game.food}% | ⚡ Power ${game.power}% | ❤️ Health ${game.health}%</li>
          <li><strong>Base Upgrades:</strong> 🌱 Greenhouse Lvl ${game.greenhouse} | ☀️ Solar Lvl ${game.solarLevel} | ☢️ Shielding Lvl ${game.radiationShielding}</li>
          <li><strong>Emergencies Handled:</strong> ${game.emergenciesHandled}</li>
        </ul>

        <h2>🎓 KEY ASTRONAUT LESSONS LEARNED</h2>
        <ul class="info-list">
          <li><strong>Closed-Loop Life Support:</strong> Oxygen and water must be continuously regenerated because resupply from Earth takes days.</li>
          <li><strong>Energy-Food-Water Nexus:</strong> Growing food in space requires balancing electrical lighting and water irrigation against crew consumption.</li>
          <li><strong>Lunar Radiation Risk:</strong> Without Earth's magnetosphere, physical shielding is essential during solar particle events.</li>
        </ul>

        <div class="nav-buttons">
          <button id="playAgainBtn">🔄 PLAY AGAIN</button>
          <button class="secondary-btn" id="aboutResultsBtn">🛰️ VIEW NASA REFERENCES</button>
        </div>
      </section>

      <p class="footer">NOVA NEXUS 26 • 2026 NASA SPACE APPS CHALLENGE</p>
    </main>
  `;

  document.querySelector('#playAgainBtn').addEventListener('click', startMission);
  document.querySelector('#aboutResultsBtn').addEventListener('click', renderAbout);
}

renderWelcome();
