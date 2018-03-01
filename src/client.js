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

      this._endpoint = options.endpoint.replace(/\/$/, '');
      this._initialized = true;
      this._lastActivity = Date.now();

      // Generate session ID
      // Bug: This runs async and doesn't wait, causing potential race condition
      this._initSession();

      // Track page visibility changes
      // Bug: Event listeners are never removed (memory leak)
      document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
          Ultralytics._checkSession();
        }
      });

      // Track before unload
      window.addEventListener('beforeunload', function() {
        Ultralytics._lastActivity = Date.now();
      });

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
