// To-Do Service - Trading Discipline & AI Agent Task Manager
const STORAGE_KEY = 'trading_todo_tasks_v1';
const AI_LOG_KEY = 'ai_agent_operations_log_v1';

export const INITIAL_TODOS = [
  {
    id: 'todo_1',
    title: 'Verify Demo Account Balance is locked at $1,000.00',
    category: 'Risk Management',
    priority: 'Critical',
    completed: true,
    description: 'Ensure trading bankroll matches the designated $1,000 initial testing capital.',
    timestamp: Date.now() - 3600000,
  },
  {
    id: 'todo_2',
    title: 'Lock Timeframe strictly to 00h05min00sec (300 seconds)',
    category: 'Strategy Calibration',
    priority: 'Critical',
    completed: true,
    description: 'Fixed-Time Trade duration and 5-minute candlestick synchronization to avoid sub-minute market noise.',
    timestamp: Date.now() - 3000000,
  },
  {
    id: 'todo_3',
    title: 'Check Economic News Calendar (Avoid high impact events)',
    category: 'Market Analysis',
    priority: 'High',
    completed: true,
    description: 'Filter out Fed/CPI/NFP release windows which can cause binary spikes breaking technical levels.',
    timestamp: Date.now() - 2400000,
  },
  {
    id: 'todo_4',
    title: 'Confirm EMA 50 & EMA 200 Higher Trend Bias on Chosen Stock',
    category: 'Market Analysis',
    priority: 'High',
    completed: false,
    description: 'Rule from r/algotrading: Never take CALL below 200 EMA, never take PUT above 200 EMA.',
    timestamp: Date.now() - 1800000,
  },
  {
    id: 'todo_5',
    title: 'Wait for Multi-Indicator Confluence Score ≥ 85-90%',
    category: 'AI Automation',
    priority: 'Critical',
    completed: false,
    description: 'Require simultaneous alignment: Bollinger outer band touch, RSI divergence, Stochastic cross, and Pinbar rejection.',
    timestamp: Date.now() - 1200000,
  },
  {
    id: 'todo_6',
    title: 'Enforce Fixed Stake Size: $25.00 (2.5% safe risk rule)',
    category: 'Risk Management',
    priority: 'Critical',
    completed: true,
    description: 'Strict prohibition against Martingale doubling. Protects $1,000 balance against drawdowns.',
    timestamp: Date.now() - 600000,
  },
  {
    id: 'todo_7',
    title: 'Post-Trade Journal & Win-Rate Recalibration',
    category: 'Journaling',
    priority: 'Medium',
    completed: false,
    description: 'Log 5m trade outcome, strike vs exit price, and review indicator behavior.',
    timestamp: Date.now() - 300000,
  },
];

class TodoService {
  constructor() {
    this.subscribers = new Set();
    this.aiLogSubscribers = new Set();
    this.loadState();
  }

  loadState() {
    try {
      const savedTodos = localStorage.getItem(STORAGE_KEY);
      this.todos = savedTodos ? JSON.parse(savedTodos) : INITIAL_TODOS;

      const savedLogs = localStorage.getItem(AI_LOG_KEY);
      this.aiLogs = savedLogs ? JSON.parse(savedLogs) : [];
    } catch (e) {
      this.todos = INITIAL_TODOS;
      this.aiLogs = [];
    }
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.todos));
      localStorage.setItem(AI_LOG_KEY, JSON.stringify(this.aiLogs.slice(0, 100)));
    } catch (e) {
      console.error('Error saving todos to localStorage', e);
    }
  }

  addTodo(title, category = 'Strategy Calibration', priority = 'Medium', description = '') {
    const newTodo = {
      id: `todo_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title,
      category,
      priority,
      completed: false,
      description,
      timestamp: Date.now(),
    };
    this.todos.unshift(newTodo);
    this.saveState();
    this.notifySubscribers();
    return newTodo;
  }

  toggleTodo(id) {
    this.todos = this.todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    this.saveState();
    this.notifySubscribers();
  }

  deleteTodo(id) {
    this.todos = this.todos.filter(t => t.id !== id);
    this.saveState();
    this.notifySubscribers();
  }

  resetDefaultRoutine() {
    this.todos = JSON.parse(JSON.stringify(INITIAL_TODOS));
    this.saveState();
    this.notifySubscribers();
  }

  // AI Agent Operation Logger
  logAIOperation(action, details, level = 'info') {
    const logItem = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      action,
      details,
      level, // 'info', 'success', 'warning', 'signal'
      time: new Date().toLocaleTimeString(),
      timestamp: Date.now(),
    };
    this.aiLogs.unshift(logItem);
    if (this.aiLogs.length > 80) this.aiLogs.pop();
    this.saveState();
    this.notifyAILogSubscribers();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    callback(this.todos);
    return () => this.subscribers.delete(callback);
  }

  subscribeAILogs(callback) {
    this.aiLogSubscribers.add(callback);
    callback(this.aiLogs);
    return () => this.aiLogSubscribers.delete(callback);
  }

  notifySubscribers() {
    this.subscribers.forEach(cb => {
      try {
        cb(this.todos);
      } catch (e) {
        console.error(e);
      }
    });
  }

  notifyAILogSubscribers() {
    this.aiLogSubscribers.forEach(cb => {
      try {
        cb(this.aiLogs);
      } catch (e) {
        console.error(e);
      }
    });
  }
}

export const todoService = new TodoService();
