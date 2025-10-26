// OpenCode SDK Integration Layer
import { createOpencode } from "@opencode-ai/sdk";

let opencodeClient = null;
let isConnected = false;

/**
 * Initialize the OpenCode client
 * @param {Object} options - Configuration options
 * @param {string} options.serverUrl - OpenCode server URL (default: http://localhost:4096)
 * @returns {Promise<Object>} - The initialized client
 */
export async function initializeOpencode(options = {}) {
  try {
    const { client } = await createOpencode({
      serverUrl: options.serverUrl || "http://localhost:4096",
      ...options
    });
    
    opencodeClient = client;
    isConnected = true;
    
    console.log("OpenCode client initialized successfully");
    return client;
  } catch (error) {
    console.error("Failed to initialize OpenCode client:", error);
    isConnected = false;
    throw error;
  }
}

/**
 * Get the current OpenCode client
 * @returns {Object|null} - The client instance or null if not initialized
 */
export function getClient() {
  return opencodeClient;
}

/**
 * Check if the client is connected
 * @returns {boolean} - Connection status
 */
export function isClientConnected() {
  return isConnected;
}

/**
 * Session management functions
 */
export const sessionAPI = {
  /**
   * List all sessions
   * @returns {Promise<Array>} - Array of sessions
   */
  async list() {
    if (!opencodeClient) {
      throw new Error("OpenCode client not initialized");
    }
    return await opencodeClient.session.list();
  },

  /**
   * Create a new session
   * @param {Object} sessionData - Session data
   * @returns {Promise<Object>} - Created session
   */
  async create(sessionData) {
    if (!opencodeClient) {
      throw new Error("OpenCode client not initialized");
    }
    return await opencodeClient.session.create({ body: sessionData });
  },

  /**
   * Get a specific session
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} - Session data
   */
  async get(sessionId) {
    if (!opencodeClient) {
      throw new Error("OpenCode client not initialized");
    }
    return await opencodeClient.session.get(sessionId);
  },

  /**
   * Delete a session
   * @param {string} sessionId - Session ID
   * @returns {Promise<void>}
   */
  async delete(sessionId) {
    if (!opencodeClient) {
      throw new Error("OpenCode client not initialized");
    }
    return await opencodeClient.session.delete(sessionId);
  },

  /**
   * Update a session
   * @param {string} sessionId - Session ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} - Updated session
   */
  async update(sessionId, updateData) {
    if (!opencodeClient) {
      throw new Error("OpenCode client not initialized");
    }
    return await opencodeClient.session.update(sessionId, { body: updateData });
  }
};

/**
 * Code review functions
 */
export const codeReviewAPI = {
  /**
   * Start a code review for a file or directory
   * @param {Object} reviewData - Review configuration
   * @param {string} reviewData.path - File or directory path
   * @param {Array<string>} reviewData.patterns - File patterns to include
   * @param {Object} reviewData.options - Review options
   * @returns {Promise<Object>} - Review session
   */
  async startReview(reviewData) {
    if (!opencodeClient) {
      throw new Error("OpenCode client not initialized");
    }
    return await opencodeClient.review.create({ body: reviewData });
  },

  /**
   * Get review results
   * @param {string} reviewId - Review ID
   * @returns {Promise<Object>} - Review results
   */
  async getReviewResults(reviewId) {
    if (!opencodeClient) {
      throw new Error("OpenCode client not initialized");
    }
    return await opencodeClient.review.get(reviewId);
  },

  /**
   * Submit feedback on a review
   * @param {string} reviewId - Review ID
   * @param {Object} feedback - Feedback data
   * @returns {Promise<Object>} - Feedback result
   */
  async submitFeedback(reviewId, feedback) {
    if (!opencodeClient) {
      throw new Error("OpenCode client not initialized");
    }
    return await opencodeClient.review.feedback(reviewId, { body: feedback });
  },

  /**
   * List available review templates
   * @returns {Promise<Array>} - Review templates
   */
  async listTemplates() {
    if (!opencodeClient) {
      throw new Error("OpenCode client not initialized");
    }
    return await opencodeClient.review.templates.list();
  }
};

/**
 * File system functions
 */
export const fileAPI = {
  /**
   * List files in a directory
   * @param {string} path - Directory path
   * @param {Object} options - Options
   * @returns {Promise<Array>} - File list
   */
  async listFiles(path, options = {}) {
    if (!opencodeClient) {
      throw new Error("OpenCode client not initialized");
    }
    return await opencodeClient.fs.list(path, options);
  },

  /**
   * Read file content
   * @param {string} path - File path
   * @returns {Promise<string>} - File content
   */
  async readFile(path) {
    if (!opencodeClient) {
      throw new Error("OpenCode client not initialized");
    }
    return await opencodeClient.fs.read(path);
  },

  /**
   * Get file statistics
   * @param {string} path - File path
   * @returns {Promise<Object>} - File stats
   */
  async getFileStats(path) {
    if (!opencodeClient) {
      throw new Error("OpenCode client not initialized");
    }
    return await opencodeClient.fs.stats(path);
  }
};

/**
 * Event handling
 */
export const eventAPI = {
  /**
   * Subscribe to session events
   * @param {Function} callback - Event callback
   * @returns {Function} - Unsubscribe function
   */
  onSessionEvent(callback) {
    if (!opencodeClient) {
      throw new Error("OpenCode client not initialized");
    }
    return opencodeClient.on('session', callback);
  },

  /**
   * Subscribe to review events
   * @param {Function} callback - Event callback
   * @returns {Function} - Unsubscribe function
   */
  onReviewEvent(callback) {
    if (!opencodeClient) {
      throw new Error("OpenCode client not initialized");
    }
    return opencodeClient.on('review', callback);
  }
};

// Export the main client for advanced usage
export { opencodeClient };