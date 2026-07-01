// PM2 Ecosystem Config — for Vultr production deployment
// Usage: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: "matka-trails-api",
      script: "server.js",
      instances: "max",    // use all CPU cores
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      env_development: {
        NODE_ENV: "development",
        PORT: 5000,
      },
      // Restart if memory exceeds 500MB
      max_memory_restart: "500M",
      // Log files
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      // Auto-restart on crash
      autorestart: true,
      watch: false,
      // Graceful reload timeout
      kill_timeout: 5000,
    },
  ],
};
