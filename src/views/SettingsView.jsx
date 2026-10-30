import { exportData } from '../storage';

export default function SettingsView({ onBack }) {
  return (
    <div className="view">
      <header className="view-header">
        <button className="btn btn-ghost" onClick={onBack}>←</button>
        <h1 className="view-title">Settings</h1>
      </header>

      <div className="settings-body">
        <div className="settings-section">
          <h2 className="section-title" style={{ padding: 0, paddingBottom: 10 }}>Backup</h2>
          <p>
            Export all your data as a JSON file. Keep a copy — localStorage can be wiped
            by "Clear browsing data."
          </p>
          <button className="btn btn-primary btn-full" onClick={exportData}>
            Export Data (JSON)
          </button>
        </div>
      </div>
    </div>
  );
}
