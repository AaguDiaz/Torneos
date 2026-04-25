// utils.js — Tournament logic

const TU = (() => {
  'use strict';

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function uid() { return Math.random().toString(36).slice(2, 9); }

  function nextPow2(n) {
    if (n <= 1) return 2;
    return Math.pow(2, Math.ceil(Math.log2(n)));
  }

  function getRoundName(numMatches, lang) {
    const es = { 1: 'Final', 2: 'Semifinal', 4: 'Cuartos de Final', 8: 'Octavos de Final', 16: 'Dieciseisavos' };
    const en = { 1: 'Final', 2: 'Semifinal', 4: 'Quarterfinal', 8: 'Round of 16', 16: 'Round of 32' };
    const map = lang === 'en' ? en : es;
    return map[numMatches] || (lang === 'en' ? `Round of ${numMatches * 2}` : `Ronda de ${numMatches * 2}`);
  }

  function blankMatch(home = null, away = null) {
    return { id: uid(), home, away, homeScore: null, awayScore: null, played: false, winner: null, isBye: false };
  }

  // ── Copa: Byes ────────────────────────────────────────────────
  function generateCopaByes(teams, lang) {
    const shuffled = shuffle(teams);
    const size = nextPow2(shuffled.length);
    // Interleave byes so they're spread across the bracket
    const padded = [...shuffled];
    while (padded.length < size) padded.push(null);

    const rounds = [];
    // Round 0
    const r0 = [];
    for (let i = 0; i < padded.length; i += 2) {
      const home = padded[i], away = padded[i + 1];
      const isBye = !home || !away;
      r0.push({ id: uid(), home, away, homeScore: null, awayScore: null, played: isBye, winner: isBye ? (home || away) : null, isBye });
    }
    rounds.push({ name: getRoundName(r0.length, lang), matches: r0 });

    // Subsequent rounds
    let prev = r0.length;
    while (prev > 1) {
      const count = Math.floor(prev / 2);
      rounds.push({ name: getRoundName(count, lang), matches: Array.from({ length: count }, () => blankMatch()) });
      prev = count;
    }

    propagateWinners(rounds);
    return rounds;
  }

  function propagateWinners(rounds) {
    for (let r = 0; r < rounds.length - 1; r++) {
      rounds[r].matches.forEach((m, i) => {
        if (m.played && m.winner) {
          const nm = rounds[r + 1].matches[Math.floor(i / 2)];
          if (i % 2 === 0) nm.home = m.winner;
          else nm.away = m.winner;
        }
      });
    }
  }

  // ── Copa: Triangular ──────────────────────────────────────────
  function generateCopaTriangular(teams, lang) {
    const shuffled = shuffle(teams);
    const n = shuffled.length;

    if (n === 3) {
      return {
        rounds: [],
        triangular: makeTriangular(shuffled)
      };
    }

    // Build bracket rounds reducing teams until <=3
    const rounds = [];
    let slots = [...shuffled];

    while (slots.length > 3) {
      const matches = [];
      if (slots.length % 2 === 0) {
        for (let i = 0; i < slots.length; i += 2)
          matches.push(blankMatch(slots[i], slots[i + 1]));
      } else {
        // Give bye to last team
        const byeTeam = slots[slots.length - 1];
        for (let i = 0; i < slots.length - 1; i += 2)
          matches.push(blankMatch(slots[i], slots[i + 1]));
        matches.push({ id: uid(), home: byeTeam, away: null, homeScore: null, awayScore: null, played: true, winner: byeTeam, isBye: true });
      }
      rounds.push({ name: getRoundName(matches.filter(m => !m.isBye).length, lang), matches });
      slots = Array(Math.ceil(slots.length / 2)).fill(null);
    }

    // Triangular phase — teams TBD (filled when bracket concludes)
    return { rounds, triangular: makeTriangular([null, null, null]) };
  }

  function makeTriangular(teams) {
    const [a, b, c] = teams;
    return {
      teams,
      matches: [
        blankMatch(a, b),
        blankMatch(a, c),
        blankMatch(b, c)
      ]
    };
  }

  // ── Copa: Apply result ────────────────────────────────────────
  function applyCopaResult(copa, roundIdx, matchIdx, homeScore, awayScore, penWinner) {
    const s = JSON.parse(JSON.stringify(copa));
    const m = s.rounds[roundIdx].matches[matchIdx];
    m.homeScore = homeScore;
    m.awayScore = awayScore;
    m.played = true;
    m.winner = homeScore > awayScore ? m.home : awayScore > homeScore ? m.away : (penWinner || m.away);
    if (homeScore === awayScore) m.penalties = true;

    if (roundIdx + 1 < s.rounds.length) {
      const nm = s.rounds[roundIdx + 1].matches[Math.floor(matchIdx / 2)];
      if (matchIdx % 2 === 0) nm.home = m.winner;
      else nm.away = m.winner;
    } else {
      s.champion = m.winner;
    }

    // If triangular: populate teams when bracket rounds done
    if (s.triangular) {
      const bracketDone = s.rounds.every(r => r.matches.every(m2 => m2.played));
      if (bracketDone && s.rounds.length > 0) {
        const lastRound = s.rounds[s.rounds.length - 1];
        const triTeams = shuffle(lastRound.matches.map(m2 => m2.winner).filter(Boolean));
        // Take first 3
        const t = triTeams.slice(0, 3);
        s.triangular = makeTriangular(t);
      }
    }

    return s;
  }

  // ── Copa: Triangular result ───────────────────────────────────
  function applyTriResult(copa, matchIdx, homeScore, awayScore) {
    const s = JSON.parse(JSON.stringify(copa));
    const m = s.triangular.matches[matchIdx];
    m.homeScore = homeScore;
    m.awayScore = awayScore;
    m.played = true;
    m.winner = homeScore > awayScore ? m.home : awayScore > homeScore ? m.away : m.home;

    // Recalc standings
    const teams = s.triangular.teams.filter(Boolean);
    const stats = {};
    teams.forEach(t => { stats[t] = { team: t, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, pts: 0 }; });
    s.triangular.matches.filter(x => x.played && x.home && x.away).forEach(x => {
      const h = stats[x.home], a = stats[x.away];
      if (!h || !a) return;
      const hs = Number(x.homeScore), as_ = Number(x.awayScore);
      h.pj++; a.pj++; h.gf += hs; h.gc += as_; a.gf += as_; a.gc += hs;
      if (hs > as_) { h.g++; h.pts += 3; a.p++; }
      else if (as_ > hs) { a.g++; a.pts += 3; h.p++; }
      else { h.e++; a.e++; h.pts++; a.pts++; }
    });
    s.triangular.standings = Object.values(stats).sort((a, b) => b.pts - a.pts || (b.gf - b.gc) - (a.gf - a.gc));

    // Check if all triangular matches played
    if (s.triangular.matches.every(x => x.played)) {
      s.champion = s.triangular.standings[0]?.team || null;
    }

    return s;
  }

  // ── Liga ──────────────────────────────────────────────────────
  function generateLiga(teams, double) {
    const list = teams.length % 2 === 0 ? [...teams] : [...teams, null];
    const n = list.length;
    const numRounds = n - 1;
    const fixtures = [];

    for (let r = 0; r < numRounds; r++) {
      for (let i = 0; i < n / 2; i++) {
        const home = list[i], away = list[n - 1 - i];
        if (home && away) {
          fixtures.push({ id: uid(), home, away, homeScore: null, awayScore: null, played: false, round: r + 1 });
        }
      }
      list.splice(1, 0, list.pop());
    }

    if (double) {
      const ret = fixtures.map(f => ({
        id: uid(), home: f.away, away: f.home,
        homeScore: null, awayScore: null, played: false,
        round: f.round + numRounds
      }));
      return [...fixtures, ...ret];
    }
    return fixtures;
  }

  function calcStandings(teams, matches) {
    const stats = {};
    teams.forEach(t => { stats[t] = { team: t, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, pts: 0, forma: [] }; });
    matches.filter(m => m.played).forEach(m => {
      const h = stats[m.home], a = stats[m.away];
      if (!h || !a) return;
      const hs = Number(m.homeScore), as_ = Number(m.awayScore);
      h.pj++; a.pj++; h.gf += hs; h.gc += as_; a.gf += as_; a.gc += hs;
      if (hs > as_) { h.g++; h.pts += 3; a.p++; h.forma.push('W'); a.forma.push('L'); }
      else if (as_ > hs) { a.g++; a.pts += 3; h.p++; a.forma.push('W'); h.forma.push('L'); }
      else { h.e++; a.e++; h.pts++; a.pts++; h.forma.push('D'); a.forma.push('D'); }
      if (h.forma.length > 5) h.forma.shift();
      if (a.forma.length > 5) a.forma.shift();
    });
    return Object.values(stats).sort((a, b) => b.pts - a.pts || (b.gf - b.gc) - (a.gf - a.gc) || b.gf - a.gf);
  }

  function applyLigaResult(matches, id, homeScore, awayScore) {
    return matches.map(m => m.id === id ? { ...m, homeScore, awayScore, played: true } : m);
  }

  // ── Helpers ───────────────────────────────────────────────────
  function getNextCopaMatch(copa) {
    // Check bracket first
    for (let r = 0; r < copa.rounds.length; r++) {
      for (let i = 0; i < copa.rounds[r].matches.length; i++) {
        const m = copa.rounds[r].matches[i];
        if (!m.played && m.home && m.away) return { type: 'bracket', roundIdx: r, matchIdx: i, match: m };
      }
    }
    // Then triangular
    if (copa.triangular) {
      for (let i = 0; i < copa.triangular.matches.length; i++) {
        const m = copa.triangular.matches[i];
        if (!m.played && m.home && m.away) return { type: 'triangular', matchIdx: i, match: m };
      }
    }
    return null;
  }

  function getNextLigaRound(matches) {
    const unplayed = matches.filter(m => !m.played);
    if (!unplayed.length) return null;
    const nextRound = Math.min(...unplayed.map(m => m.round));
    return { round: nextRound, matches: unplayed.filter(m => m.round === nextRound) };
  }

  // ── PES MÁGICO ────────────────────────────────────────────────
  function generateMagico(teams) {
    // pairs (0,1),(2,3),(4,5) must be in different groups
    const pairs = [[0,1],[2,3],[4,5]];
    const gA = [], gB = [];
    pairs.forEach(([a, b]) => {
      if (Math.random() < 0.5) { gA.push(teams[a]); gB.push(teams[b]); }
      else { gA.push(teams[b]); gB.push(teams[a]); }
    });
    function mkGroupMatches(t) {
      return [blankMatch(t[0], t[1]), blankMatch(t[0], t[2]), blankMatch(t[1], t[2])];
    }
    return {
      groups: {
        A: { teams: gA, matches: mkGroupMatches(gA) },
        B: { teams: gB, matches: mkGroupMatches(gB) }
      },
      upperFinal: null, lowerSemi1: null, lowerSemi2: null,
      lowerFinal: null, lowerVsUpper: null, grandFinal: null,
      champion: null
    };
  }

  function calcMagicoGroupStandings(group) {
    const st = {};
    group.teams.forEach(t => { st[t] = { team: t, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 }; });
    group.matches.filter(m => m.played && m.home && m.away).forEach(m => {
      const h = st[m.home], a = st[m.away];
      if (!h || !a) return;
      const hs = +m.homeScore, as_ = +m.awayScore;
      h.pj++; a.pj++; h.gf += hs; h.gc += as_; a.gf += as_; a.gc += hs;
      if (hs > as_) { h.pg++; h.pts += 3; a.pp++; }
      else if (as_ > hs) { a.pg++; a.pts += 3; h.pp++; }
      else { h.pe++; a.pe++; h.pts++; a.pts++; }
    });
    return Object.values(st).sort((a, b) => b.pts - a.pts || (b.gf - b.gc) - (a.gf - a.gc) || b.gf - a.gf);
  }

  function applyMagicoGroupResult(magico, group, matchIdx, homeScore, awayScore) {
    const s = JSON.parse(JSON.stringify(magico));
    const m = s.groups[group].matches[matchIdx];
    m.homeScore = homeScore; m.awayScore = awayScore; m.played = true;
    m.winner = homeScore > awayScore ? m.home : awayScore > homeScore ? m.away : null;
    const aAll = s.groups.A.matches.every(x => x.played);
    const bAll = s.groups.B.matches.every(x => x.played);
    if (aAll && bAll && !s.upperFinal) {
      const stA = calcMagicoGroupStandings(s.groups.A);
      const stB = calcMagicoGroupStandings(s.groups.B);
      s.upperFinal = blankMatch(stA[0].team, stB[0].team);
      s.lowerSemi1 = blankMatch(stA[1].team, stB[2].team);
      s.lowerSemi2 = blankMatch(stB[1].team, stA[2].team);
    }
    return s;
  }

  function applyMagicoPlayoffResult(magico, matchKey, homeScore, awayScore, penWinner) {
    const s = JSON.parse(JSON.stringify(magico));
    const m = s[matchKey];
    m.homeScore = homeScore; m.awayScore = awayScore; m.played = true;
    const winner = homeScore > awayScore ? m.home : awayScore > homeScore ? m.away : (penWinner || m.home);
    m.winner = winner;
    if (homeScore === awayScore) m.penalties = true;
    const loser = winner === m.home ? m.away : m.home;
    if (matchKey === 'upperFinal') {
      if (s.lowerFinal && s.lowerFinal.played) {
        s.lowerVsUpper = blankMatch(s.lowerFinal.winner, loser);
      }
    } else if (matchKey === 'lowerSemi1' || matchKey === 'lowerSemi2') {
      if (s.lowerSemi1 && s.lowerSemi1.played && s.lowerSemi2 && s.lowerSemi2.played) {
        s.lowerFinal = blankMatch(s.lowerSemi1.winner, s.lowerSemi2.winner);
      }
    } else if (matchKey === 'lowerFinal') {
      if (s.upperFinal && s.upperFinal.played) {
        const uLoser = s.upperFinal.winner === s.upperFinal.home ? s.upperFinal.away : s.upperFinal.home;
        s.lowerVsUpper = blankMatch(winner, uLoser);
      }
    } else if (matchKey === 'lowerVsUpper') {
      const uWinner = s.upperFinal && s.upperFinal.winner;
      if (uWinner) s.grandFinal = blankMatch(winner, uWinner);
    } else if (matchKey === 'grandFinal') {
      s.champion = winner;
    }
    return s;
  }

  function calcMagicoStats(magico) {
    const allTeams = [...magico.groups.A.teams, ...magico.groups.B.teams];
    const stats = {};
    allTeams.forEach(t => { stats[t] = { team: t, pj: 0, pg: 0, pp: 0, gf: 0, gc: 0 }; });
    const allMatches = [
      ...magico.groups.A.matches,
      ...magico.groups.B.matches,
      ...[magico.upperFinal, magico.lowerSemi1, magico.lowerSemi2,
          magico.lowerFinal, magico.lowerVsUpper, magico.grandFinal
      ].filter(Boolean)
    ];
    allMatches.filter(m => m.played && m.home && m.away).forEach(m => {
      const h = stats[m.home], a = stats[m.away];
      if (!h || !a) return;
      const hs = +m.homeScore, as_ = +m.awayScore;
      h.pj++; a.pj++; h.gf += hs; h.gc += as_; a.gf += as_; a.gc += hs;
      if (m.winner === m.home) { h.pg++; a.pp++; }
      else if (m.winner === m.away) { a.pg++; h.pp++; }
    });
    return allTeams
      .map(t => ({ ...stats[t], wr: stats[t].pj > 0 ? (stats[t].pg / stats[t].pj * 100) : 0 }))
      .sort((a, b) => b.wr - a.wr || b.pg - a.pg || b.gf - a.gf);
  }

  return {
    generateCopaByes, generateCopaTriangular,
    applyCopaResult, applyTriResult,
    generateLiga, calcStandings, applyLigaResult,
    getNextCopaMatch, getNextLigaRound,
    getRoundName, propagateWinners,
    generateMagico, calcMagicoGroupStandings,
    applyMagicoGroupResult, applyMagicoPlayoffResult, calcMagicoStats
  };
})();
