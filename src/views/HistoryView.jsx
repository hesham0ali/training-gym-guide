import { useState } from 'react';
import { getSessions } from '../storage';
import program from '../program.json';

const { exercises, workouts } = program;

export default function HistoryView({ onBack }) {
  const sessions = getSessions()
    .filter(s => s.completedAt)
    .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));

  const [expanded, setExpanded] = useState(null);

  function workoutName(id) {
    return workouts.find(w => w.id === id)?.name ?? id;
  }

  function exerciseName(id) {
    return exercises[id]?.name ?? id;
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-GB', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    });
  }

  function groupByExercise(sets) {
    return sets.reduce((acc, set) => {
      if (!acc[set.exerciseId]) acc[set.exerciseId] = [];
      acc[set.exerciseId].push(set);
      return acc;
    }, {});
  }

  return (
    <div className="view">
      <header className="view-header">
        <button className="btn btn-ghost" onClick={onBack}>←</button>
        <h1 className="view-title">History</h1>
      </header>

      {sessions.length === 0 ? (
        <p className="empty">No completed sessions yet.</p>
      ) : (
        <div className="history-list">
          {sessions.map(s => (
            <div
              key={s.id}
              className="session-card"
              onClick={() => setExpanded(prev => prev === s.id ? null : s.id)}
            >
              <div className="session-card-header">
                <span className="session-card-name">{workoutName(s.workoutId)}</span>
                <span className="session-card-date">{formatDate(s.startedAt)}</span>
                <span className="session-card-chevron">{expanded === s.id ? '▲' : '▼'}</span>
              </div>

              {expanded === s.id && (
                <div className="session-detail">
                  {Object.entries(groupByExercise(s.sets)).map(([eid, sets]) => (
                    <div key={eid}>
                      <div className="session-exercise-name">{exerciseName(eid)}</div>
                      <div className="session-sets">
                        {sets
                          .sort((a, b) => a.setIndex - b.setIndex)
                          .map(set => (
                            <span key={set.setIndex} className="session-set">
                              {set.weight}kg × {set.reps}
                            </span>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
