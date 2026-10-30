import { useState, useEffect } from 'react';
import { getInProgressSession, getSessions, deleteSession, getBWLog, saveBWLog } from '../storage';
import program from '../program.json';

const { workouts } = program;

export default function HomeView({ onStartWorkout, onNav }) {
  const [inProgress, setInProgress] = useState(null);
  const [recent, setRecent] = useState([]);
  const [bw, setBw] = useState('');
  const [bwSaved, setBwSaved] = useState(false);

  useEffect(() => {
    setInProgress(getInProgressSession());
    setRecent(
      getSessions()
        .filter(s => s.completedAt)
        .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
        .slice(0, 3)
    );
  }, []);

  function workoutName(id) {
    return workouts.find(w => w.id === id)?.name ?? id;
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-GB', {
      weekday: 'short', day: 'numeric', month: 'short',
    });
  }

  function handleDiscard() {
    if (!confirm(`Discard "${workoutName(inProgress.workoutId)}"? This cannot be undone.`)) return;
    deleteSession(inProgress.id);
    setInProgress(null);
  }

  function handleBwSubmit(e) {
    e.preventDefault();
    if (!bw) return;
    const log = getBWLog();
    const today = new Date().toISOString().slice(0, 10);
    const idx = log.findIndex(entry => entry.date === today);
    if (idx !== -1) log[idx].weight = parseFloat(bw);
    else log.push({ date: today, weight: parseFloat(bw) });
    saveBWLog(log);
    setBw('');
    setBwSaved(true);
    setTimeout(() => setBwSaved(false), 2000);
  }

  return (
    <div className="view">
      <h1 className="app-title">Training</h1>

      {inProgress && (
        <div className="resume-banner">
          <div className="resume-info">
            <span className="resume-label">In progress</span>
            <span className="resume-name">{workoutName(inProgress.workoutId)}</span>
          </div>
          <div className="resume-actions">
            <button className="btn btn-primary" onClick={() => onStartWorkout(inProgress.workoutId)}>
              Resume
            </button>
            <button className="btn btn-danger" onClick={handleDiscard}>
              Discard
            </button>
          </div>
        </div>
      )}

      <section>
        <h2 className="section-title">Start Workout</h2>
        <div className="workout-grid">
          {workouts.map(w => (
            <button
              key={w.id}
              className="btn btn-workout"
              onClick={() => onStartWorkout(w.id)}
            >
              {w.name}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title">Bodyweight</h2>
        <form className="bw-form" onSubmit={handleBwSubmit}>
          <input
            type="number"
            className="input bw-input"
            placeholder="kg"
            step="0.1"
            min="30"
            max="300"
            inputMode="decimal"
            value={bw}
            onChange={e => setBw(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            {bwSaved ? '✓' : 'Log'}
          </button>
        </form>
      </section>

      {recent.length > 0 && (
        <section>
          <h2 className="section-title">Recent</h2>
          <div className="recent-list">
            {recent.map(s => (
              <div key={s.id} className="recent-row">
                <span className="recent-name">{workoutName(s.workoutId)}</span>
                <span className="recent-date">{formatDate(s.startedAt)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <nav className="bottom-nav">
        <button className="nav-btn nav-btn-active">Home</button>
        <button className="nav-btn" onClick={() => onNav('history')}>History</button>
        <button className="nav-btn" onClick={() => onNav('settings')}>Settings</button>
      </nav>
    </div>
  );
}
