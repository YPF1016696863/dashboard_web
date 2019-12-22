const DOMAIN_TO_REPLACE = "chinambse.com";
export const appSettingsConfig = {
    server: {
        "backendUrl": "http://datavis-api." + DOMAIN_TO_REPLACE
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
    appSettingsConfig.server.backendUrl = "http://" + hostname + ":30050";
} else {
    const blocks = hostname.split(".");
    const primaryBlocks = blocks.length >= 3 ? blocks.slice(1) : blocks;
    const primary = primaryBlocks.join(".");
    appSettingsConfig.server.backendUrl = appSettingsConfig.server.backendUrl.replace(DOMAIN_TO_REPLACE, primary);
}

export default function init(ngModule) {
    ngModule.constant('appSettings', appSettingsConfig);
}

init.init = true;
