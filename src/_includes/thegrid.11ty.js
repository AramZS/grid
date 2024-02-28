const metadata = require("../_data/metadata.js");
// const site = require("../_data/site.js");
const meta = require("./partials/meta.11ty");
const nav = require("./partials/nav.11ty");
const gridbox = require("./partials/gridbox.11ty");
const databox = require("./partials/databox.11ty");
const footer = require("./partials/footer.11ty");

const utils = require("../utils");

module.exports = async function (data, zones) {
	// console.log("layout data", data);

	zones = zones ? zones : {};
	let getHashTagsFromText = function (text = "") {
		let words = {};
		let splits = text.split(/(\#[A-Za-z][^\s\.\'\"\!\,\?\;\}\{]*)/g);
		for (let split of splits) {
			if (split.startsWith("#")) {
				let tag = split.substr(1).toLowerCase();
				if (!words[tag]) {
					words[tag] = 0;
				}
				words[tag]++;
			}
		}
		return words;
	};
	let meta_description = data?.description || data.site?.description || "";
	let metaChunk = meta(
		data,
		`${data.site.title}`,
		meta_description,
		data?.tags ? data.tags : [],
		data?.featuredImage
			? [`${process.env.DOMAIN}/img/${data.featuredImage}`]
			: []
	);
	let templateStyle = "";
	if (zones.template) {
		templateStyle = `<link rel="stylesheet" href="/assets/css/template-${zones.template}.css">`;
	}
	console.log(
		"main",
		data.collections.categoryObjects,
		Object.keys(data.collections.categoryObjects)
	);
	// let categorySets = []
	let boxes = Object.keys(data.collections.categoryObjects).reduce(
		(acc, keyString) => {
			let topic = keyString.replace("topic-", "");
			acc.push(topic);
			return acc;
		},
		[]
	);
	let itemCount = 0;
	let grid = "";
	for (let key in data.collections.categoryObjects) {
		console.log("key", key);
		let tags = [];
		itemCount += data.collections.categoryObjects[key].length;
		let databoxes = data.collections.categoryObjects[key].reduce(
			(acc, postObj) => {
				tags = postObj.data.tags
					? postObj.data.tags.reduce((tagArray, tag) => {
							tagArray.push(`<span class="tag">${tag}</span>`);
							return tagArray;
					  }, tags)
					: tags;
				acc += databox(data, postObj, key);
				return acc;
			},
			""
		);
		let tagsToUse = tags.slice(0, 3);
		// console.log(tagsToUse);
		//databoxes += databox(data.collections.categoryObjects[key], key);
		grid += `${gridbox(
			data,
			key.replace("topic-", ""),
			data.collections.categoryObjects[key].length,
			tagsToUse.join(", "),
			databoxes
		)}`;
	}

	return /*html*/ `<!DOCTYPE html>
	<html lang="en">
	  <head>
		<meta charset="utf-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<meta name="description" content="${data.site.description}" />
		${metaChunk}
		<title>${data.site.title}: ${data.title}</title>
	
		<link
		  id="favicon"
		  rel="icon"
		  href="https://glitch.com/edit/favicon-app.ico"
		  type="image/x-icon"
		/>
		<!-- import the webpage's stylesheet -->
		<link rel="stylesheet" type="text/css" href="/assets/css/normalize.css" />
		<!-- <link rel="stylesheet" type="text/css" href="/assets/css/aug-ui-2.css" /> -->
		<link rel="stylesheet" type="text/css" href="https://unpkg.com/augmented-ui@2/augmented-ui.min.css">
		<!-- <link rel="stylesheet" href="/assets/css/aug-user-style.css" /> -->
		<link rel="stylesheet" href="/assets/css/user-style.css" />
	  </head>
	  <body>
		<header data-augmented-ui>
		  <h1 class="first-title">HC Personal DB</h1><span id="to-the-spin" onclick="(function(){window.location='/'})()"><span id="to-the-spin__seperator">|&nbsp;&nbsp;</span>(<span id="to-the-spin__link" onmouseout="deglitchify(this)" onmouseover="window.glitchify(this)" data-text="The Spin">The Spin</span>)</span>
		</header>
	
		<main id="grid-container">
			${grid}
		</main>
		
		${footer()}
		<!-- import the webpage's client-side javascript file -->
		<script src="/assets/js/script.js"></script>
	  </body>
	</html>`;
};
