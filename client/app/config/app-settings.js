export const appSettingsConfig = {
    server: {
        // eslint-disable-next-line no-undef
        "backendUrl": API_SERVER
    },
    "logging": {},
    "env": {}
};

export default function init(ngModule) {
    ngModule.constant('appSettings', appSettingsConfig);
}

init.init = true;
