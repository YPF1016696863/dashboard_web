export const appSettingsConfig = {
    server: {
        backendUrl: 'http://datavis-api.chinambse.com'
    },
    app: {
        login: 'http://login.chinambse.com',
		logout:'http://login.chinambse.com/logout',
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
