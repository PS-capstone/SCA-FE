import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
export interface StudentUser {
  id: string;
  realName: string;
  username: string;
  classCode: string;
  totalCoral: number;
  currentCoral: number;
  totalExplorationData: number;
  mainFish: string;
}

export interface TeacherUser {
  id: string;
  realName: string;
  username: string;
  email: string;
  classes: string[];
}

export interface Theme {
  mode: 'light' | 'dark';
  language: 'ko' | 'en';
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
}

// State Interface
export interface AppState {
  // Authentication
  user: StudentUser | TeacherUser | null;
  isAuthenticated: boolean;
  userType: 'student' | 'teacher' | null;
  
  // Theme
  theme: Theme;
  
  // UI State
  loading: boolean;
  notifications: Notification[];
  
  // Data
  quests: any[];
  raids: any[];
}

// Action Types
export type AppAction =
  | { type: 'SET_USER'; payload: { user: StudentUser | TeacherUser; userType: 'student' | 'teacher' } }
  | { type: 'CLEAR_USER' }
  | { type: 'SET_THEME'; payload: Partial<Theme> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'timestamp'> }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'SET_QUESTS'; payload: any[] }
  | { type: 'SET_RAIDS'; payload: any[] };

// Initial State
const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  userType: null,
  theme: {
    mode: 'light',
    language: 'ko'
  },
  loading: false,
  notifications: [],
  quests: [],
  raids: []
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        userType: action.payload.userType
      };
    
    case 'CLEAR_USER':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        userType: null
      };
    
    case 'SET_THEME':
      return {
        ...state,
        theme: { ...state.theme, ...action.payload }
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    
    case 'ADD_NOTIFICATION':
      const notification: Notification = {
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date()
      };
      return {
        ...state,
        notifications: [...state.notifications, notification]
      };
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    
    case 'SET_QUESTS':
      return {
        ...state,
        quests: action.payload
      };
    
    case 'SET_RAIDS':
      return {
        ...state,
        raids: action.payload
      };
    
    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider Component
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom Hooks
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export function useAuth() {
  const { state, dispatch } = useApp();
  
  const login = (user: StudentUser | TeacherUser, userType: 'student' | 'teacher') => {
    dispatch({ type: 'SET_USER', payload: { user, userType } });
  };
  
  const logout = () => {
    dispatch({ type: 'CLEAR_USER' });
  };
  
  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    userType: state.userType,
    login,
    logout
  };
}

export function useTheme() {
  const { state, dispatch } = useApp();
  
  const setTheme = (theme: Partial<Theme>) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };
  
  return {
    theme: state.theme,
    setTheme
  };
}

export function useNotifications() {
  const { state, dispatch } = useApp();
  
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  };
  
  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };
  
  return {
    notifications: state.notifications,
    addNotification,
    removeNotification
  };
}

export function useQuests() {
  const { state, dispatch } = useApp();
  
  const setQuests = (quests: any[]) => {
    dispatch({ type: 'SET_QUESTS', payload: quests });
  };
  
  return {
    quests: state.quests,
    setQuests
  };
}

export function useRaids() {
  const { state, dispatch } = useApp();
  
  const setRaids = (raids: any[]) => {
    dispatch({ type: 'SET_RAIDS', payload: raids });
  };
  
  return {
    raids: state.raids,
    setRaids
  };
}
