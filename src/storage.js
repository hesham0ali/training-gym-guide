const SESSIONS_KEY = 'sessions';
const BW_KEY = 'bodyweightLog';

export function getSessions() {
  try {
    return JSON.parse(localStorage.getItem(SESSIONS_KEY)) ?? [];
  } catch {
    return [];
  }
}

function saveSessions(sessions) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function updateSession(updatedSession) {
  const sessions = getSessions();
  const idx = sessions.findIndex(s => s.id === updatedSession.id);
  if (idx !== -1) sessions[idx] = updatedSession;
  else sessions.push(updatedSession);
  saveSessions(sessions);
}

export function deleteSession(sessionId) {
  saveSessions(getSessions().filter(s => s.id !== sessionId));
}

export function getInProgressSession() {
  return getSessions().find(s => !s.completedAt) ?? null;
}

export function getPrefill(exerciseId, setIndex) {
  const candidates = getSessions()
    .filter(s => s.completedAt && s.sets.some(set => set.exerciseId === exerciseId))
    .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));

  if (!candidates.length) return null;

  const setsForExercise = candidates[0].sets
    .filter(s => s.exerciseId === exerciseId)
    .sort((a, b) => a.setIndex - b.setIndex);

  const exact = setsForExercise.find(s => s.setIndex === setIndex);
  if (exact) return { weight: exact.weight, reps: exact.reps };

  const last = setsForExercise[setsForExercise.length - 1];
  return last ? { weight: last.weight, reps: last.reps } : null;
}

export function getBWLog() {
  try {
    return JSON.parse(localStorage.getItem(BW_KEY)) ?? [];
  } catch {
    return [];
  }
}

export function saveBWLog(log) {
  localStorage.setItem(BW_KEY, JSON.stringify(log));
}

export function exportData() {
  const data = { sessions: getSessions(), bodyweightLog: getBWLog() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `workout-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
