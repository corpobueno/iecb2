module.exports = {
  apps: [{
    name: 'iecbc',
    script: 'serve',
    args: '-s build -l 3000',
    cwd: './client',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};