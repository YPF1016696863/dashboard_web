export const appSettingsConfig = {
    server: {
        // eslint-disable-next-line no-undef
        "backendUrl": API_SERVER
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

// eslint-disable-next-line no-undef
if (!API_SERVER) {
    const hostname = window.location.hostname;
    if (hostname.startsWith("localhost") ||
        hostname.startsWith("docker-internal") ||
        checkIsIPV4(hostname)) {
        appSettingsConfig.server.backendUrl = "http://" + hostname + ":30050";
    } else {
        const blocks = hostname.split(".");
        const primaryBlocks = blocks.length >= 3 ? blocks.slice(1) : blocks;
        const primary = primaryBlocks.join(".");

        appSettingsConfig.server.backendUrl = "http://datavis-api."+primary;
    }
}

export default function init(ngModule) {
    ngModule.constant('appSettings', appSettingsConfig);
}

init.init = true;
