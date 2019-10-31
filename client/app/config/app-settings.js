const DOMAIN_TO_REPLACE = "chinambse.com";

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

function checkIsIPV4(entry) {
    const blocks = entry.split(".");
    if (blocks.length === 4) {
        return blocks.every(function (block) {
            return parseInt(block, 10) >= 0 && parseInt(block, 10) <= 255;
        });
    }
    return false;
}

const hostname = window.location.hostname;

if (hostname.startsWith("localhost") ||
    hostname.startsWith("docker-internal") ||
    checkIsIPV4(hostname)) {
    appSettingsConfig.server.backendUrl = "http://" + hostname + ":30050";
    appSettingsConfig.app.login = "http://" + hostname + ":30092";
    appSettingsConfig.app.logout = "http://" + hostname + ":30092/logout?email=current";
    appSettingsConfig.app.activate = "http://" + hostname + ":30092/active";
} else {
    const blocks = hostname.split(".");
    const primaryBlocks = blocks.length >= 3 ? blocks.slice(1) : blocks;
    const primary = primaryBlocks.join(".");

    appSettingsConfig.server.backendUrl = appSettingsConfig.server.backendUrl.replace(DOMAIN_TO_REPLACE, primary);
    appSettingsConfig.app.login = appSettingsConfig.app.login.replace(DOMAIN_TO_REPLACE, primary);
    appSettingsConfig.app.logout = appSettingsConfig.app.logout.replace(DOMAIN_TO_REPLACE, primary);
    appSettingsConfig.app.activate = appSettingsConfig.app.activate.replace(DOMAIN_TO_REPLACE, primary);
}

export default function init(ngModule) {
    ngModule.constant('appSettings', appSettingsConfig);
}

init.init = true;
