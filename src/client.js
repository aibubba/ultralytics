/**
 * Ultralytics Browser Client
 * A lightweight analytics tracking library
 */
(function(window) {
  'use strict';

  var Ultralytics = {
    _initialized: false,
    _endpoint: null,
    _sessionId: null,
    _sessionTimeout: 30 * 60 * 1000, // 30 minutes
    _lastActivity: null,
    _boundHandlers: {},

    /**
     * Initialize the Ultralytics client
     * @param {Object} options - Configuration options
     * @param {string} options.endpoint - The server endpoint URL
     */
    init: function(options) {
      if (!options || !options.endpoint) {
        console.error('Ultralytics: endpoint is required');
        return;
      }

      // Clean up any existing listeners to prevent memory leaks
      // This handles the case where init() is called multiple times
      if (this._initialized) {
        this._removeEventListeners();
      }

      this._endpoint = options.endpoint.replace(/\/$/, '');
      this._initialized = true;
      this._lastActivity = Date.now();

      // Generate session ID
      // Bug: This runs async and doesn't wait, causing potential race condition
      this._initSession();

      // Store bound event handlers for cleanup
      this._boundHandlers.visibilityChange = function() {
        if (document.visibilityState === 'visible') {
          Ultralytics._checkSession();
        }
      };
      this._boundHandlers.beforeUnload = function() {
        Ultralytics._lastActivity = Date.now();
      };

      // Track page visibility changes
      document.addEventListener('visibilitychange', this._boundHandlers.visibilityChange);

      // Track before unload
      window.addEventListener('beforeunload', this._boundHandlers.beforeUnload);

      console.log('Ultralytics initialized');
    },

    /**
     * Initialize or restore session
     */
    _initSession: function() {
      var stored = this._getStoredSession();
      
      if (stored && (Date.now() - stored.lastActivity) < this._sessionTimeout) {
        this._sessionId = stored.id;
        this._lastActivity = stored.lastActivity;
      } else {
        // Generate new session ID
        this._sessionId = this._generateId();
      }
      
      this._storeSession();
    },

    /**
     * Check if session is still valid
     */
    _checkSession: function() {
      if (!this._lastActivity || (Date.now() - this._lastActivity) > this._sessionTimeout) {
        this._sessionId = this._generateId();
      }
      this._lastActivity = Date.now();
      this._storeSession();
    },

    /**
     * Generate a unique ID
     */
    _generateId: function() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0;
        var v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    },

    /**
     * Store session in localStorage
     */
    _storeSession: function() {
      try {
        localStorage.setItem('ultralytics_session', JSON.stringify({
          id: this._sessionId,
          lastActivity: this._lastActivity
        }));
      } catch (e) {
        // localStorage not available
      }
    },

    /**
     * Get stored session from localStorage
     */
    _getStoredSession: function() {
      try {
        var stored = localStorage.getItem('ultralytics_session');
        return stored ? JSON.parse(stored) : null;
      } catch (e) {
        return null;
      }
    },

    /**
     * Track an event
     * @param {string} name - Event name
     * @param {Object} properties - Event properties
     */
    track: function(name, properties) {
      if (!this._initialized) {
        console.error('Ultralytics: not initialized. Call init() first.');
        return;
      }

      this._lastActivity = Date.now();
      this._storeSession();

      var data = {
        name: name,
        properties: properties || {},
        sessionId: this._sessionId,
        timestamp: new Date().toISOString()
      };

      this._send('/api/events', data);
    },

    /**
     * Track a page view
     * @param {Object} properties - Additional page view properties
     */
    trackPageView: function(properties) {
      var pageProps = {
        url: window.location.href,
        path: window.location.pathname,
        title: document.title,
        referrer: document.referrer || null
      };

      // Merge custom properties
      if (properties) {
        for (var key in properties) {
          if (properties.hasOwnProperty(key)) {
            pageProps[key] = properties[key];
          }
        }
      }

      this.track('page_view', pageProps);
    },

    /**
     * Remove event listeners (internal helper)
     */
    _removeEventListeners: function() {
      if (this._boundHandlers.visibilityChange) {
        document.removeEventListener('visibilitychange', this._boundHandlers.visibilityChange);
      }
      if (this._boundHandlers.beforeUnload) {
        window.removeEventListener('beforeunload', this._boundHandlers.beforeUnload);
      }
      this._boundHandlers = {};
    },

    /**
     * Clean up event listeners and reset state
     * Call this when removing the tracker
     */
    destroy: function() {
      if (!this._initialized) {
        return;
      }

      // Remove event listeners
      this._removeEventListeners();

      // Reset state
      this._initialized = false;
      this._endpoint = null;
      this._sessionId = null;

      console.log('Ultralytics destroyed');
    },

    /**
     * Track a custom event (alias for track with event type)
     * @param {string} eventName - Name of the event
     * @param {Object} properties - Event properties
     */
    trackEvent: function(eventName, properties) {
      var eventProps = {
        eventType: 'custom'
      };

      // Merge custom properties
      if (properties) {
        for (var key in properties) {
          if (properties.hasOwnProperty(key)) {
            eventProps[key] = properties[key];
          }
        }
      }

      this.track(eventName, eventProps);
    },

    /**
     * Send data to the server
     */
    _send: function(path, data) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', this._endpoint + path, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      
      xhr.onreadystatechange = function() {
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
  };

  // Expose to window
  window.Ultralytics = Ultralytics;

})(window);
