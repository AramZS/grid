var utils = require("../utils");

module.exports = {
	layout: "layouts/grid-item.njk",
	contentType: "entry",
	permalinkBase: "entry",
	language: null,
	status: null,
	eleventyComputed: {
		permalink(data) {
			return `entry/${utils.slugger(data.title)}/`;
		},
	},
};
