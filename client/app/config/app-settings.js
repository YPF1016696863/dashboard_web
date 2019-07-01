export const appSettingsConfig = {
    server: {
        backendUrl: 'http://datavis-api.chinambse.com'
    },
    app: {
        login: 'http://login.chinambse.com',
        setup: '',
        help: ''
    },
    logging: {},
    env: {}
};

// for debug with container
if (window.location.hostname.startsWith("localhost")) {
    appSettingsConfig.server.backendUrl = "http://localhost:5000";
    appSettingsConfig.app.login = "http://localhost:8092";
}

export default function init(ngModule) {
    ngModule.constant('appSettings', appSettingsConfig);
}

init.init = true;
