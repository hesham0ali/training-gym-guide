import { useState } from 'react';
import { getSessions, updateSession, getPrefill } from '../storage';
import program from '../program.json';

const { exercises, workouts } = program;

export default function WorkoutView({ workoutId, onFinish, onBack }) {
  const workout = workouts.find(w => w.id === workoutId);

  const [session, setSession] = useState(() => {
    const sessions = getSessions();
    return sessions.find(s => s.workoutId === workoutId && !s.completedAt) ?? null;
  });

  const [inputs, setInputs] = useState(() => {
    const sessions = getSessions();
    const existing = sessions.find(s => s.workoutId === workoutId && !s.completedAt);
    const existingSets = existing?.sets ?? [];

    const result = {};
    workout.exerciseSlots.forEach(slot => {
      for (let i = 0; i < slot.sets; i++) {
        const key = `${slot.exerciseId}-${i}`;
        const logged = existingSets.find(s => s.exerciseId === slot.exerciseId && s.setIndex === i);
        if (logged) {
          result[key] = { weight: String(logged.weight), reps: String(logged.reps) };
        } else {
          const prefill = getPrefill(slot.exerciseId, i);
          result[key] = {
            weight: prefill ? String(prefill.weight) : '',
            reps: prefill ? String(prefill.reps) : '',
          };
        }
      }
    });
    return result;
  });

  function getLoggedSet(exerciseId, setIndex) {
    if (!session) return null;
    return session.sets.find(s => s.exerciseId === exerciseId && s.setIndex === setIndex) ?? null;
  }

  function isProgressionReady(slot) {
    if (!session) return false;
    const logged = session.sets.filter(s => s.exerciseId === slot.exerciseId);
    if (logged.length < slot.sets) return false;
    return logged.length === slot.sets && logged.every(s => s.reps >= slot.repRange[1]);
  }

  function handleLog(slot, setIndex) {
    const key = `${slot.exerciseId}-${setIndex}`;
    const { weight, reps } = inputs[key];
    if (!weight || !reps) return;

    const setLog = {
      exerciseId: slot.exerciseId,
      setIndex,
      weight: parseFloat(weight),
      reps: parseInt(reps, 10),
    };

    let current = session;
    if (!current) {
      current = {
        id: String(Date.now()),
        workoutId,
        startedAt: new Date().toISOString(),
        completedAt: null,
        sets: [],
      };
    }

    const newSets = current.sets.filter(
      s => !(s.exerciseId === slot.exerciseId && s.setIndex === setIndex)
    );
    newSets.push(setLog);

    const updated = { ...current, sets: newSets };
    setSession(updated);
    updateSession(updated);
  }

  function updateInput(exerciseId, setIndex, field, value) {
    const key = `${exerciseId}-${setIndex}`;
    setInputs(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  }

  function handleFinish() {
    if (session) {
      const completed = { ...session, completedAt: new Date().toISOString() };
      updateSession(completed);
    }
    onFinish();
  }

  return (
    <div className="view">
      <header className="workout-header">
        <button className="btn btn-ghost" onClick={onBack}>←</button>
        <h1 className="workout-title">{workout.name}</h1>
        <button className="btn btn-primary" onClick={handleFinish}>Finish</button>
      </header>

      <div className="exercise-list">
        {workout.exerciseSlots.map(slot => {
          const exercise = exercises[slot.exerciseId];
          const progressionReady = isProgressionReady(slot);

          return (
            <div key={slot.exerciseId} className="exercise-card">
              <div className="exercise-header">
                <div className="exercise-meta">
                  <span className="exercise-name">{exercise.name}</span>
                  <span className="exercise-prescription">
                    {slot.sets}×{slot.repRange[0]}–{slot.repRange[1]}
                    {' · '}{slot.rest}s rest
                    {slot.negatives && ' · 3s neg'}
                  </span>
                </div>
                {progressionReady && (
                  <span className="badge badge-progress">ADD WEIGHT</span>
                )}
              </div>

              <div className="set-rows">
                {Array.from({ length: slot.sets }, (_, i) => {
                  const key = `${slot.exerciseId}-${i}`;
                  const logged = getLoggedSet(slot.exerciseId, i);
                  const inp = inputs[key] ?? { weight: '', reps: '' };

                  return (
                    <div key={i} className={`set-row${logged ? ' set-row-done' : ''}`}>
                      <span className="set-num">{i + 1}</span>
                      <input
                        type="number"
                        className="input set-input"
                        placeholder="kg"
                        inputMode="decimal"
                        step="0.5"
                        value={inp.weight}
                        onChange={e => updateInput(slot.exerciseId, i, 'weight', e.target.value)}
                        onFocus={e => e.target.select()}
                        disabled={!!logged}
                      />
                      <span className="set-x">×</span>
                      <input
                        type="number"
                        className="input set-input"
                        placeholder="reps"
                        inputMode="numeric"
                        value={inp.reps}
                        onChange={e => updateInput(slot.exerciseId, i, 'reps', e.target.value)}
                        onFocus={e => e.target.select()}
                        disabled={!!logged}
                      />
                      {logged ? (
                        <span className="set-check">✓</span>
                      ) : (
                        <button
                          className="btn btn-log"
                          onClick={() => handleLog(slot, i)}
                          disabled={!inp.weight || !inp.reps}
                        >
                          Log
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="workout-footer">
        <button className="btn btn-primary btn-full" onClick={handleFinish}>
          Finish Workout
        </button>
      </div>
    </div>
  );
}
