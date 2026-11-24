import React, { useState } from 'react';
import { CheckSquare, Square, Plus, Trash2, ListChecks, Bot, Sparkles, Filter, AlertCircle, ShieldCheck } from 'lucide-react';

export default function TodoApp({
  todos,
  onToggleTodo,
  onDeleteTodo,
  onAddTodo,
  onResetRoutine,
  aiLogs,
}) {
  const [activeTab, setActiveTab] = useState('checklist'); // 'checklist', 'ai_logs', 'new_task'
  const [filterCategory, setFilterCategory] = useState('ALL');
  
  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Strategy Calibration');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newDescription, setNewDescription] = useState('');

  const completedCount = todos.filter(t => t.completed).length;
  const progressPct = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  const categories = ['ALL', 'Risk Management', 'Strategy Calibration', 'Market Analysis', 'AI Automation', 'Journaling'];

  const filteredTodos = todos.filter(t => {
    if (filterCategory === 'ALL') return true;
    return t.category === filterCategory;
  });

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTodo(newTitle.trim(), newCategory, newPriority, newDescription.trim());
    setNewTitle('');
    setNewDescription('');
    setActiveTab('checklist');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-4">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-950/70 border border-cyan-800/60 text-cyan-400">
            <ListChecks className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Trading Disciplines & AI To-Do Engine</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300">
                {completedCount}/{todos.length} Done
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Systematic checklist & real-time operational agent logs
            </p>
          </div>
        </div>

        {/* Tab Controls (Responsive scroll for iPhone) */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs w-full sm:w-auto overflow-x-auto pb-0.5 sm:pb-1">
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 ${
              activeTab === 'checklist'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Checklist ({todos.length})
          </button>
          <button
            onClick={() => setActiveTab('ai_logs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 ${
              activeTab === 'ai_logs'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Ops ({aiLogs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('new_task')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 ${
              activeTab === 'new_task'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Discipline Progress Bar */}
      {activeTab === 'checklist' && (
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="font-semibold">Trading Discipline Progress</span>
            <span className="font-mono text-cyan-400 font-bold">{progressPct}% Complete</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Tab 1: Interactive Checklist */}
      {activeTab === 'checklist' && (
        <div className="space-y-3">
          {/* Category Filter Pills & Routine Reset */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition cursor-pointer shrink-0 ${
                    filterCategory === cat
                      ? 'bg-cyan-950 border-cyan-700 text-cyan-300 font-semibold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={onResetRoutine}
              className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold px-2 py-1 rounded bg-slate-800/80 border border-slate-700/80 transition"
              title="Regenerate standard 90% win-rate checklist"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Reset Standard Routine</span>
            </button>
          </div>

          {/* Tasks List */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {filteredTodos.map((todo) => (
              <div
                key={todo.id}
                className={`p-3 rounded-xl border transition-all ${
                  todo.completed
                    ? 'bg-slate-950/30 border-slate-800/40 opacity-70'
                    : 'bg-slate-850/90 border-slate-750 hover:border-cyan-500/40'
                } flex items-start justify-between gap-3`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() => onToggleTodo(todo.id)}
                    className="mt-0.5 text-cyan-400 hover:text-cyan-300 transition shrink-0"
                  >
                    {todo.completed ? (
                      <CheckSquare className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-500" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold ${todo.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                        {todo.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        {todo.category}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        todo.priority === 'Critical'
                          ? 'bg-rose-950/80 text-rose-400 border border-rose-800'
                          : todo.priority === 'High'
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {todo.priority}
                      </span>
                    </div>

                    {todo.description && (
                      <p className="text-[11px] text-slate-400">
                        {todo.description}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onDeleteTodo(todo.id)}
                  className="text-slate-500 hover:text-rose-400 transition p-1"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: AI Bot Operations Stream */}
      {activeTab === 'ai_logs' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-semibold">
            <span>Live Agent Autonomous Actions</span>
            <span className="text-[10px] text-emerald-400 font-mono">Stream Active</span>
          </div>

          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {aiLogs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                The AI Agent will stream its real-time analytical and execution operations here as it scans market bars.
              </div>
            ) : (
              aiLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs flex items-start gap-2.5"
                >
                  <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1 shrink-0 animate-ping" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-cyan-300">{log.action}</span>
                      <span className="text-[10px] font-mono text-slate-500">{log.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">{log.details}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Create New Task Form */}
      {activeTab === 'new_task' && (
        <form onSubmit={handleCreateTask} className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Task Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Check 5M stochastic cross after US session open..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {categories.filter(c => c !== 'ALL').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description / Notes (Optional)
            </label>
            <textarea
              rows="2"
              placeholder="Add details, indicator thresholds, or verification steps..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('checklist')}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-slate-950 transition"
            >
              Save Task
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
