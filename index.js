module.exports = {
  init: require('./src/commands/init'),
  install: require('./src/commands/install'),
  list: require('./src/commands/list'),
  remove: require('./src/commands/remove'),
  update: require('./src/commands/update'),
  audit: require('./src/commands/audit'),
  login: require('./src/commands/login')
};
