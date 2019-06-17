export const appSettingsConfig = {
    server: {
        backendUrl: 'http://39.98.168.0:5000'
    },
    app: {
        login: 'http://login.chinambse.com',
        setup: '',
        help: ''
    },
    logging: {},
    env: {}
};

export default function init(ngModule) {
    ngModule.constant('appSettings', appSettingsConfig);
}

init.init = true;
