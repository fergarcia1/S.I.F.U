import { Match } from "../models/match";
import { Teams } from "../models/teams";
import { MatchEvent } from "../models/match-event";

/** UTIL */
function randomChance(prob: number) {
  return Math.random() < prob;
}

/** Probabilidades por posición */
const GOAL_PROB_BY_POS = {
  GK: 0,
  DF: 0.015,
  MF: 0.035,
  FW: 0.07
};

const ASSIST_PROB_BY_POS = {
  DF: 0.02,
  MF: 0.06,
  FW: 0.08,
  GK: 0
};

const CARD_YELLOW_BY_POS = {
  GK: 0.002,
  DF: 0.02,
  MF: 0.015,
  FW: 0.01
};

const CARD_RED_BY_POS = {
  GK: 0.0002,
  DF: 0.002,
  MF: 0.001,
  FW: 0.0007
};

/** ELEGIR JUGADOR */
function pickStarterByWeight(team: Teams, weightFunc: (p: any) => number) {
  const starters = team.squad.filter(p => p.isStarter);
  const arr: any[] = [];

  starters.forEach(p => {
    const w = weightFunc(p);
    for (let i = 0; i < w * 10; i++) arr.push(p);
  });

  return arr[Math.floor(Math.random() * arr.length)];
}

/** Probabilidad de gol del equipo basada en rating del plantel */
function getTeamStrength(team: Teams): number {
  const starters = team.squad.filter(p => p.isStarter);
  const avg = starters.reduce((a, b) => a + b.rating, 0) / starters.length;
  return avg / 100; 
}

/** Gol según rating del equipo + posición del jugador */
function tryGenerateGoal(team: Teams, minute: number) {

  const player = pickStarterByWeight(
    team,
    p => GOAL_PROB_BY_POS[p.position as keyof typeof GOAL_PROB_BY_POS] + p.rating / 200
  );

  if (player.position === "GK") return null;

  const baseProb = GOAL_PROB_BY_POS[player.position as keyof typeof GOAL_PROB_BY_POS];
  const ratingBoost = player.rating / 200;
  const minuteBoost = minute > 70 ? 0.005 : 0;
  const totalProb = baseProb + ratingBoost + minuteBoost;

  if (!randomChance(totalProb)) return null;

  let assistPlayer = null;

  if (randomChance(0.45)) {
    assistPlayer = pickStarterByWeight(
      team,
      p => ASSIST_PROB_BY_POS[p.position as keyof typeof ASSIST_PROB_BY_POS] + p.rating / 250
    );

    if (assistPlayer.id === player.id) assistPlayer = null;
  }

  return { scorer: player, assist: assistPlayer };
}

/** Tarjetas */
function tryGenerateCard(team: Teams): { player: any; type: "yellow" | "red" } | null {
  const player = pickStarterByWeight(
    team,
    p => CARD_YELLOW_BY_POS[p.position as keyof typeof CARD_YELLOW_BY_POS] + p.rating / 300
  );

  // Amarilla
  if (
    randomChance(
      CARD_YELLOW_BY_POS[player.position as keyof typeof CARD_YELLOW_BY_POS] + 0.01
    )
  ) {
    return { player, type: "yellow" };
  }

  // Roja
  if (
    randomChance(
      CARD_RED_BY_POS[player.position as keyof typeof CARD_RED_BY_POS] + 0.005
    )
  ) {
    return { player, type: "red" };
  }

  return null;
}


/* ==========================================================
   🔵 SIMULACIÓN PROGRESIVA (MINUTO A MINUTO)
   ========================================================== */
export function simulateFullMatchRealTime(
  match: Match,
  homeTeam: Teams,
  awayTeam: Teams,
  onMinute: (evs: MatchEvent[], minute: number, score: { home: number; away: number }) => void,
  onFinish: (result: { homeGoals: number; awayGoals: number; events: MatchEvent[] }) => void
) {
  let minute = 1;
  const allEvents: MatchEvent[] = [];
  let homeGoals = 0;
  let awayGoals = 0;

  const homeStrength = getTeamStrength(homeTeam);
  const awayStrength = getTeamStrength(awayTeam);

  const timer = setInterval(() => {
    const events: MatchEvent[] = [];

    // Gol local
    if (randomChance(homeStrength * 0.02)) {
      const g = tryGenerateGoal(homeTeam, minute);
      if (g) {
        homeGoals++;
        events.push({
          minute,
          type: "goal",
          playerId: g.scorer.id,
          assistId: g.assist?.id ?? null,
          teamId: homeTeam.id
        });
      }
    }

    // Gol visitante
    if (randomChance(awayStrength * 0.02)) {
      const g = tryGenerateGoal(awayTeam, minute);
      if (g) {
        awayGoals++;
        events.push({
          minute,
          type: "goal",
          playerId: g.scorer.id,
          assistId: g.assist?.id ?? null,
          teamId: awayTeam.id
        });
      }
    }

    // Tarjetas
    if (randomChance(0.02)) {
      const card = tryGenerateCard(homeTeam);
      if (card) {
        events.push({
          minute,
          type: card.type,
          playerId: card.player.id,
          teamId: homeTeam.id
        });
      }
    }

    if (randomChance(0.02)) {
      const card = tryGenerateCard(awayTeam);
      if (card) {
        events.push({
          minute,
          type: card.type,
          playerId: card.player.id,
          teamId: awayTeam.id
        });
      }
    }

    // Emitir minuto
    onMinute(events, minute, { home: homeGoals, away: awayGoals });

    allEvents.push(...events);

    if (minute >= 90) {
      clearInterval(timer);
      onFinish({ homeGoals, awayGoals, events: allEvents });
    }

    minute++;

  }, 300);
}

/* ==========================================================
   🔵 SIMULACIÓN COMPLETA (INSTANTÁNEA)
   ========================================================== */
export function simulateFullMatch(
  match: Match,
  homeTeam: Teams,
  awayTeam: Teams
) {
  const events: MatchEvent[] = [];
  let homeGoals = 0;
  let awayGoals = 0;

  for (let minute = 1; minute <= 90; minute++) {
    // Goles
    if (randomChance(getTeamStrength(homeTeam) * 0.02)) {
      const g = tryGenerateGoal(homeTeam, minute);
      if (g) {
        homeGoals++;
        events.push({
          minute,
          type: 'goal',
          playerId: g.scorer.id,
          assistId: g.assist?.id ?? null,
          teamId: homeTeam.id
        });
      }
    }
    if (randomChance(getTeamStrength(awayTeam) * 0.02)) {
      const g = tryGenerateGoal(awayTeam, minute);
      if (g) {
        awayGoals++;
        events.push({
          minute,
          type: 'goal',
          playerId: g.scorer.id,
          assistId: g.assist?.id ?? null,
          teamId: awayTeam.id
        });
      }
    }

    // Tarjetas
    const cardHome = tryGenerateCard(homeTeam);
    if (cardHome) {
      events.push({
        minute,
        type: cardHome.type,
        playerId: cardHome.player.id,
        teamId: homeTeam.id
      });
    }
    const cardAway = tryGenerateCard(awayTeam);
    if (cardAway) {
      events.push({
        minute,
        type: cardAway.type,
        playerId: cardAway.player.id,
        teamId: awayTeam.id
      });
    }
  }

  return { homeGoals, awayGoals, events };
}


