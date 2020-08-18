(async function() {
  const { MODE } = process.env;

  switch (MODE) {
    case 'API':
      require('./api');
      break;
    case 'SOCKETS':
      require('./sockets');
      break;
    default:
      console.error('Failed to specify startup mode, aborting...');
      process.exit(1);
  }
})();
