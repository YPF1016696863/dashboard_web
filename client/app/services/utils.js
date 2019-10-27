// eslint-disable-next-line import/prefer-default-export
export function absoluteUrl(url) {
	const DOMAIN_TO_REPLACE = "DOMAIN_TO_REPLACE";
	let activate = "http://datavis-login." + DOMAIN_TO_REPLACE + "/active";

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
		activate = "http://" + hostname + ":30092/active";
	} else {
		const blocks = hostname.split(".");
		const primaryBlocks = blocks.length >= 3 ? blocks.slice(1) : blocks;
		const primary = primaryBlocks.join(".");

		activate = activate.replace(DOMAIN_TO_REPLACE, primary);
	}

	return activate + "?token=" + (url.replace("/reset/", "").replace("/invite/", ""));
}
