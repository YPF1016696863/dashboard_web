const appSettings = {
  server: {
    backendUrl: 'http://39.98.168.0:5000',
  },
  app: {
    login: 'http://localhost:3000/',
    setup: '',
    help: '',
  },
  logging: {
  },
  env: {
  },
};

export default function init(ngModule) {
  ngModule.constant('appSettings', appSettings);
}

init.init = true;
