const DOMAIN_TO_REPLACE = "DOMAIN_TO_REPLACE";
export const appSettingsConfig = {
    server: {
        "backendUrl": "http://datavis-api." + DOMAIN_TO_REPLACE
    },
    app: {
        "login": "http://datavis-login." + DOMAIN_TO_REPLACE,
        "logout": "http://datavis-login." + DOMAIN_TO_REPLACE + "/logout?email=current",
        "activate": "http://datavis-login." + DOMAIN_TO_REPLACE + "/active",
        "setup": '',
        "help": ''
    },
    "logging": {},
    "env": {}
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
    appSettingsConfig.server.backendUrl = "http://" + hostname + ":5000";
    appSettingsConfig.app.login = "http://" + hostname + ":8092";
    appSettingsConfig.app.logout = "http://" + hostname + ":8092/logout?email=current";
    appSettingsConfig.app.activate = "http://" + hostname + ":8092/active";
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
