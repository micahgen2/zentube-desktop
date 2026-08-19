import React, { useState } from 'react';
import {
  Sparkles,
  Shield,
  Server,
  PlaySquare,
  Sliders,
  Download,
  Upload,
  Check,
  AlertTriangle,
  RotateCcw,
  Layers,
} from 'lucide-react';
import { UserSettings } from '../types';
import { storageService, DEFAULT_SETTINGS } from '../services/storage';
import { youtubeApi, DEFAULT_INVIDIOUS_INSTANCES } from '../services/api';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdateSettings }) => {
  const [customInstance, setCustomInstance] = useState(
    () => localStorage.getItem('zentube_custom_instance') || ''
  );
  const [instanceTesting, setInstanceTesting] = useState(false);
  const [instanceTestStatus, setInstanceTestStatus] = useState<string | null>(null);
  const [exportCopied, setExportCopied] = useState(false);

  const handleCustomInstanceSave = () => {
    if (customInstance.trim()) {
      youtubeApi.setCustomInstance(customInstance.trim());
      setInstanceTestStatus('Custom instance configured and saved.');
    } else {
      youtubeApi.setCustomInstance(null);
      setInstanceTestStatus('Reset to default instance pool.');
    }
  };

  const handleTestInstance = async () => {
    setInstanceTesting(true);
    setInstanceTestStatus(null);
    try {
      const target = customInstance.trim() || youtubeApi.getActiveInstance();
      const res = await fetch(`${target}/api/v1/trending`, { method: 'GET' });
      if (res.ok) {
        setInstanceTestStatus('Connection successful! Instance is active and responsive.');
      } else {
        setInstanceTestStatus(`HTTP ${res.status}: Instance responded with error.`);
      }
    } catch (err: any) {
      setInstanceTestStatus(`Connection failed: ${err.message}`);
    } finally {
      setInstanceTesting(false);
    }
  };

  const handleExportData = () => {
    const backupJson = storageService.exportBackup();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zentube_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content && storageService.importBackup(content)) {
        alert('Data imported successfully! The app will refresh.');
        window.location.reload();
      } else {
        alert('Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 max-w-4xl mx-auto flex flex-col gap-6">
      <div className="border-b border-zinc-800/80 pb-3">
        <h1 className="text-xl font-bold text-zinc-100">Settings</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Customize your distraction-free viewing experience, privacy instances, and player behavior.
        </p>
      </div>

      {/* 1. Distraction-Free & Mindful Browsing */}
      <div className="rounded-2xl bg-[#121216]/50 border border-zinc-800/80 p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-zinc-800/60 pb-2.5">
          <Sparkles className="w-4 h-4 text-red-400" />
          <h3 className="font-semibold text-sm text-zinc-200">Distraction-Free Experience</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Zen Mode */}
          <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 cursor-pointer">
            <div>
              <span className="font-semibold text-zinc-200 block">Default Zen Mode</span>
              <span className="text-[11px] text-zinc-400">
                Automatically launch videos in distraction-free focus mode
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.zenMode}
              onChange={(e) => onUpdateSettings({ zenMode: e.target.checked })}
              className="accent-red-500 w-4 h-4 cursor-pointer"
            />
          </label>

          {/* Hide Comments */}
          <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 cursor-pointer">
            <div>
              <span className="font-semibold text-zinc-200 block">Hide Video Comments</span>
              <span className="text-[11px] text-zinc-400">
                Disable comment section below videos
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.hideComments}
              onChange={(e) => onUpdateSettings({ hideComments: e.target.checked })}
              className="accent-red-500 w-4 h-4 cursor-pointer"
            />
          </label>

          {/* Hide Recommendations */}
          <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 cursor-pointer">
            <div>
              <span className="font-semibold text-zinc-200 block">Hide Related Videos</span>
              <span className="text-[11px] text-zinc-400">
                Remove suggested video sidebar while watching
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.hideRecommendations}
              onChange={(e) => onUpdateSettings({ hideRecommendations: e.target.checked })}
              className="accent-red-500 w-4 h-4 cursor-pointer"
            />
          </label>

          {/* Hide Metrics */}
          <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 cursor-pointer">
            <div>
              <span className="font-semibold text-zinc-200 block">Hide View & Sub Counts</span>
              <span className="text-[11px] text-zinc-400">
                Mindful viewing without popularity bias
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.hideMetrics}
              onChange={(e) => onUpdateSettings({ hideMetrics: e.target.checked })}
              className="accent-red-500 w-4 h-4 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* 2. Video Player Preferences */}
      <div className="rounded-2xl bg-[#121216]/50 border border-zinc-800/80 p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-zinc-800/60 pb-2.5">
          <PlaySquare className="w-4 h-4 text-red-400" />
          <h3 className="font-semibold text-sm text-zinc-200">Player Preferences</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Default Quality */}
          <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <span className="font-semibold text-zinc-200">Default Video Quality</span>
            <select
              value={settings.defaultQuality}
              onChange={(e) => onUpdateSettings({ defaultQuality: e.target.value as any })}
              className="bg-zinc-800 text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-700 focus:outline-none focus:border-red-500 text-xs"
            >
              <option value="auto">Auto (Best Available)</option>
              <option value="1080p">1080p HD</option>
              <option value="720p">720p HD</option>
              <option value="480p">480p SD</option>
              <option value="360p">360p (Low Data)</option>
            </select>
          </div>

          {/* Autoplay */}
          <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 cursor-pointer">
            <div>
              <span className="font-semibold text-zinc-200 block">Autoplay Next Video</span>
              <span className="text-[11px] text-zinc-400">
                Automatically start the next related video on finish
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.autoplayNext}
              onChange={(e) => onUpdateSettings({ autoplayNext: e.target.checked })}
              className="accent-red-500 w-4 h-4 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* 3. API & Privacy Instance Pool */}
      <div className="rounded-2xl bg-[#121216]/50 border border-zinc-800/80 p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-zinc-800/60 pb-2.5">
          <Server className="w-4 h-4 text-red-400" />
          <h3 className="font-semibold text-sm text-zinc-200">Invidious / Privacy Instance</h3>
        </div>

        <div className="flex flex-col gap-3 text-xs">
          <div>
            <label className="font-semibold text-zinc-300 block mb-1">
              Active Invidious Instance Pool
            </label>
            <div className="text-[11px] text-zinc-400 mb-2">
              ZenTube automatically rotates through active public nodes if any instance goes down:
            </div>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_INVIDIOUS_INSTANCES.slice(0, 4).map((inst) => (
                <span
                  key={inst}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-[11px] text-zinc-300"
                >
                  {inst.replace('https://', '')}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 pt-2">
            <label className="font-semibold text-zinc-300">Custom Self-Hosted Instance URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://my-invidious-instance.org"
                value={customInstance}
                onChange={(e) => setCustomInstance(e.target.value)}
                className="flex-1 bg-zinc-900 text-zinc-200 px-3 py-1.5 rounded-xl border border-zinc-700 focus:border-red-500 focus:outline-none"
              />
              <button
                onClick={handleCustomInstanceSave}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium"
              >
                Save
              </button>
              <button
                onClick={handleTestInstance}
                disabled={instanceTesting}
                className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-medium border border-zinc-700"
              >
                {instanceTesting ? 'Testing...' : 'Test'}
              </button>
            </div>
            {instanceTestStatus && (
              <span className="text-[11px] text-zinc-400 mt-1">{instanceTestStatus}</span>
            )}
          </div>
        </div>
      </div>

      {/* 4. Local Data & Backup */}
      <div className="rounded-2xl bg-[#121216]/50 border border-zinc-800/80 p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-zinc-800/60 pb-2.5">
          <Shield className="w-4 h-4 text-red-400" />
          <h3 className="font-semibold text-sm text-zinc-200">Local Data & Privacy</h3>
        </div>

        <p className="text-xs text-zinc-400">
          All your subscriptions, playlists, and watch history are stored 100% locally on your machine. No accounts, telemetry, or personal tracking.
        </p>

        <div className="flex flex-wrap gap-3 pt-1">
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-red-400" />
            <span>Export Backup (JSON)</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>Import Backup (JSON)</span>
            <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
};
