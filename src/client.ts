/**
 * Ultralytics Browser Client
 * A lightweight analytics tracking library
 */

import type {
  UltralyticsOptions,
  EventProperties,
  UserTraits,
  PageViewProperties,
  BatchEvent,
  EventData,
  StoredSession,
  BatchResult,
  BatchCallback,
} from './types';

interface BoundHandlers {
  visibilityChange?: () => void;
  beforeUnload?: () => void;
  popState?: () => void;
}

class UltralyticsClient {
  private _initialized: boolean = false;
  private _endpoint: string | null = null;
  private _sessionId: string | null = null;
  private _userId: string | null = null;
  private _sessionTimeout: number = 30 * 60 * 1000; // 30 minutes
  private _lastActivity: number | null = null;
  private _boundHandlers: BoundHandlers = {};
  private _autoTrack: boolean = false;
  private _lastTrackedPath: string | null = null;

  /**
   * Initialize the Ultralytics client
   */
  init(options: UltralyticsOptions): void {
    if (!options || !options.endpoint) {
      console.error('Ultralytics: endpoint is required');
      return;
    }

    // Clean up any existing listeners to prevent memory leaks
    if (this._initialized) {
      this._removeEventListeners();
    }

    this._endpoint = options.endpoint.replace(/\/$/, '');
    this._lastActivity = Date.now();
    this._autoTrack = options.autoTrack || false;

    // Initialize session synchronously to avoid race conditions
    this._initSession();

    // Only mark as initialized after session is ready
    this._initialized = true;

    // Restore user ID from localStorage if available
    this._restoreUserId();

    // Store bound event handlers for cleanup
    this._boundHandlers.visibilityChange = (): void => {
      if (document.visibilityState === 'visible') {
        this._checkSession();
      }
    };
    this._boundHandlers.beforeUnload = (): void => {
      this._lastActivity = Date.now();
    };

    // Track page visibility changes
    document.addEventListener('visibilitychange', this._boundHandlers.visibilityChange);

    // Track before unload
    window.addEventListener('beforeunload', this._boundHandlers.beforeUnload);

    // Set up automatic page view tracking if enabled
    if (this._autoTrack) {
      this._setupAutoTracking(options.trackInitialPageView !== false);
    }

    console.log('Ultralytics initialized');
  }

  /**
   * Initialize or restore session
   */
  private _initSession(): void {
    const stored = this._getStoredSession();

    if (stored && (Date.now() - stored.lastActivity) < this._sessionTimeout) {
      this._sessionId = stored.id;
      this._lastActivity = stored.lastActivity;
    } else {
      this._sessionId = this._generateId();
    }

    this._storeSession();
  }

  /**
   * Check if session is still valid
   */
  private _checkSession(): void {
    if (!this._lastActivity || (Date.now() - this._lastActivity) > this._sessionTimeout) {
      this._sessionId = this._generateId();
    }
    this._lastActivity = Date.now();
    this._storeSession();
  }

  /**
   * Set up automatic page view tracking
   */
  private _setupAutoTracking(trackInitial: boolean): void {
    // Track initial page view if requested
    if (trackInitial) {
      this._lastTrackedPath = window.location.pathname;
      this.trackPageView();
    }

    // Listen for browser back/forward navigation
    this._boundHandlers.popState = (): void => {
      this._onHistoryChange();
    };
    window.addEventListener('popstate', this._boundHandlers.popState);

    // Intercept pushState and replaceState for SPA navigation
    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);

    history.pushState = (...args): void => {
      originalPushState(...args);
      this._onHistoryChange();
    };

    history.replaceState = (...args): void => {
      originalReplaceState(...args);
      this._onHistoryChange();
    };
  }

  /**
   * Handle history changes for SPA navigation tracking
   */
  private _onHistoryChange(): void {
    const currentPath = window.location.pathname;
    
    // Only track if the path actually changed
    if (currentPath !== this._lastTrackedPath) {
      this._lastTrackedPath = currentPath;
      this.trackPageView();
    }
  }

  /**
   * Generate a unique ID
   */
  private _generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }


  /**
   * Store session in localStorage
   */
  private _storeSession(): void {
    try {
      localStorage.setItem('ultralytics_session', JSON.stringify({
        id: this._sessionId,
        lastActivity: this._lastActivity
      }));
    } catch (e) {
      // localStorage not available
    }
  }

  /**
   * Get stored session from localStorage
   */
  private _getStoredSession(): StoredSession | null {
    try {
      const stored = localStorage.getItem('ultralytics_session');
      return stored ? JSON.parse(stored) as StoredSession : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Restore user ID from localStorage
   */
  private _restoreUserId(): void {
    try {
      const userId = localStorage.getItem('ultralytics_user_id');
      if (userId) {
        this._userId = userId;
      }
    } catch (e) {
      // localStorage not available
    }
  }

  /**
   * Track an event
   */
  track(name: string, properties?: EventProperties): void {
    if (!this._initialized) {
      console.error('Ultralytics: not initialized. Call init() first.');
      return;
    }

    // Ensure we have a session ID (defensive check)
    if (!this._sessionId) {
      this._sessionId = this._generateId();
      this._storeSession();
    }


    this._lastActivity = Date.now();
    this._storeSession();

    const data: EventData = {
      name: name,
      properties: properties || {},
      sessionId: this._sessionId,
      userId: this._userId,
      timestamp: new Date().toISOString()
    };

    this._send('/api/events', data);
  }

  /**
   * Track a page view
   */
  trackPageView(properties?: PageViewProperties): void {
    const pageProps: PageViewProperties = {
      url: window.location.href,
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer || null
    };

    // Merge custom properties
    if (properties) {
      Object.keys(properties).forEach((key) => {
        pageProps[key] = properties[key];
      });
    }

    this.track('page_view', pageProps);
  }

  /**
   * Remove event listeners (internal helper)
   */
  private _removeEventListeners(): void {
    if (this._boundHandlers.visibilityChange) {
      document.removeEventListener('visibilitychange', this._boundHandlers.visibilityChange);
    }
    if (this._boundHandlers.beforeUnload) {
      window.removeEventListener('beforeunload', this._boundHandlers.beforeUnload);
    }
    if (this._boundHandlers.popState) {
      window.removeEventListener('popstate', this._boundHandlers.popState);
    }
    this._boundHandlers = {};
  }

  /**
   * Clean up event listeners and reset state
   */
  destroy(): void {
    if (!this._initialized) {
      return;
    }


    // Remove event listeners
    this._removeEventListeners();

    // Reset state
    this._initialized = false;
    this._endpoint = null;
    this._sessionId = null;
    this._userId = null;
    this._autoTrack = false;
    this._lastTrackedPath = null;

    console.log('Ultralytics destroyed');
  }

  /**
   * Track a custom event (alias for track with event type)
   */
  trackEvent(eventName: string, properties?: EventProperties): void {
    const eventProps: EventProperties = {
      eventType: 'custom'
    };

    // Merge custom properties
    if (properties) {
      Object.keys(properties).forEach((key) => {
        eventProps[key] = properties[key];
      });
    }

    this.track(eventName, eventProps);
  }

  /**
   * Identify a user
   */
  identify(userId: string, traits?: UserTraits): void {
    if (!this._initialized) {
      console.error('Ultralytics: not initialized. Call init() first.');
      return;
    }

    if (!userId) {
      console.error('Ultralytics: userId is required for identify()');
      return;
    }

    this._userId = userId;

    // Store user ID in localStorage for persistence
    try {
      localStorage.setItem('ultralytics_user_id', userId);
    } catch (e) {
      // localStorage not available
    }

    // Optionally track an identify event with user traits
    if (traits) {
      this.track('identify', traits);
    }

    console.log('Ultralytics: user identified', userId);
  }


  /**
   * Get the current user ID
   */
  getUserId(): string | null {
    return this._userId;
  }

  /**
   * Clear the current user (for logout scenarios)
   */
  clearUser(): void {
    this._userId = null;
    try {
      localStorage.removeItem('ultralytics_user_id');
    } catch (e) {
      // localStorage not available
    }
  }

  /**
   * Track multiple events in a single request
   */
  trackBatch(events: BatchEvent[], callback?: BatchCallback): void {
    if (!this._initialized) {
      const error = new Error('Ultralytics: not initialized. Call init() first.');
      console.error(error.message);
      if (callback) callback(error);
      return;
    }

    if (!Array.isArray(events) || events.length === 0) {
      const error = new Error('Ultralytics: events must be a non-empty array');
      console.error(error.message);
      if (callback) callback(error);
      return;
    }

    this._lastActivity = Date.now();
    this._storeSession();

    // Prepare events with session and user info
    const preparedEvents: EventData[] = events.map((event) => ({
      name: event.name,
      properties: event.properties || {},
      sessionId: this._sessionId!,
      userId: this._userId,
      timestamp: event.timestamp || new Date().toISOString()
    }));

    this._sendBatch(preparedEvents, callback);
  }


  /**
   * Send batch data to the server
   */
  private _sendBatch(events: EventData[], callback?: BatchCallback): void {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', this._endpoint + '/api/events/batch', true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = (): void => {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          if (callback) {
            try {
              const result = JSON.parse(xhr.responseText) as BatchResult;
              callback(null, result);
            } catch (e) {
              callback(null, { success: true });
            }
          }
        } else {
          const error = new Error('Failed to send batch: ' + xhr.status);
          console.error('Ultralytics: failed to send batch', xhr.status);
          if (callback) callback(error);
        }
      }
    };

    xhr.send(JSON.stringify({ events: events }));
  }

  /**
   * Send data to the server
   */
  private _send(path: string, data: EventData): void {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', this._endpoint + path, true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = (): void => {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          // Success
        } else {
          console.error('Ultralytics: failed to send event', xhr.status);
        }
      }
    };

    xhr.send(JSON.stringify(data));
  }
}

// Create singleton instance
const Ultralytics = new UltralyticsClient();

// Export for module usage
export { Ultralytics, UltralyticsClient };

// Also expose to window for script tag usage
if (typeof window !== 'undefined') {
  (window as any).Ultralytics = Ultralytics;
}

export default Ultralytics;
