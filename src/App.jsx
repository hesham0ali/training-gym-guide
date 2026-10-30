import { useState } from 'react';
import HomeView from './views/HomeView';
import WorkoutView from './views/WorkoutView';
import HistoryView from './views/HistoryView';
import SettingsView from './views/SettingsView';

export default function App() {
  const [view, setView] = useState('home');
  const [activeWorkoutId, setActiveWorkoutId] = useState(null);

  function startWorkout(workoutId) {
    setActiveWorkoutId(workoutId);
    setView('workout');
  }

  function finishWorkout() {
    setActiveWorkoutId(null);
    setView('home');
  }

  return (
    <div className="app">
      {view === 'home' && (
        <HomeView onStartWorkout={startWorkout} onNav={setView} />
      )}
      {view === 'workout' && activeWorkoutId && (
        <WorkoutView workoutId={activeWorkoutId} onFinish={finishWorkout} onBack={() => setView('home')} />
      )}
      {view === 'history' && (
        <HistoryView onBack={() => setView('home')} />
      )}
      {view === 'settings' && (
        <SettingsView onBack={() => setView('home')} />
      )}
    </div>
  );
}
