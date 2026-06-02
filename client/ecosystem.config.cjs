module.exports = {
  apps: [{
    name: 'iecbc',
    script: 'npx',
    args: 'serve -s build -l 3000',
    cwd: __dirname,
    exec_mode: 'fork',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
