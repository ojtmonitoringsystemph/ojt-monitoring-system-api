// Purpose: To store all the constants used in the application.
export const config = {
  PORT: 5000,

  MESSAGE: {
    WELCOME: "You're successfully connected to OJT MONITORING SYSTEM API.",
  },

  DB: {
    // Create you own mongodb URI from Atlas MongoDB and use it here.
    URI: "mongodb+srv://ojtmonitoringsystemph:Z92P4sX9asbCdyPk@ojt-cluster-dev.8pagc67.mongodb.net/dev?retryWrites=true&w=majority&appName=OJT-Cluster-Dev",
    ERROR: "Error connecting to database: ",
    NOT_INITIALIZED: "Database connection not initialized",
    CONNECTED: "Connected to database",
  },

  CLOUDINARY: {
    CLOUD_NAME: "ojt-dev",
    API_KEY: "955948597478288",
    API_SECRET: "Q-qTBc4jUiF9j-kMPii6vDaj2pc",
  },
};
