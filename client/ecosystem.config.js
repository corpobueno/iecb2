module.exports = {
  apps: [{
    name: 'manda-gelo-client',
    script: 'serve',
    args: '-s build -l 5183',
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