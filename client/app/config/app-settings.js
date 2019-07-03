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
if (window.location.hostname.startsWith("localhost") ||
    window.location.hostname.startsWith("docker-internal") ||
    window.location.hostname.startsWith("192.168")) {
    appSettingsConfig.server.backendUrl = "http://" + window.location.hostname + ":5000";
    appSettingsConfig.app.login = "http://" + window.location.hostname + ":8092";
}

export default function init(ngModule) {
    ngModule.constant('appSettings', appSettingsConfig);
}

init.init = true;
