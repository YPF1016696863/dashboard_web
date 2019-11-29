const DOMAIN_TO_REPLACE = "chinambse.com";
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


export default function init(ngModule) {
    ngModule.constant('appSettings', appSettingsConfig);
}

init.init = true;
