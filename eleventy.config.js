const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");

const path = require("path");
var slugify = require("slugify");
var markdownIt = require("markdown-it");
var mila = require("markdown-it-link-attributes");
const utils = require("./src/utils");

require("dotenv").config();

let domain_name = "grid.talesfromthesp.in";
let throwOnUndefinedSetting = false;

let scheme = "https://";

if (process.env.IS_LOCAL) {
	domain_name = "localhost:8083";
	throwOnUndefinedSetting = false;
	console.log("Dev env");
	scheme = "http://";
}

let site = scheme + domain_name;

process.env.DOMAIN = site;
process.env.DOMAIN_NAME = domain_name;
process.env.SITE_NAME = "The Grid";
process.env.DESCRIPTION = "A digital frontier.";
process.env.BASIC_IMAGE = `${domain_name}/img/nyc_noir.jpg`;
process.env.PRIMARY_AUTHOR = "Aram Zucker-Scharff";

module.exports = function (eleventyConfig) {
	eleventyConfig.ignores.add("README.md");
	//eleventyConfig.addWatchTarget("../public");
	eleventyConfig.addPassthroughCopy("src/assets/**");
	// eleventyConfig.addPassthroughCopy("src/assets/**");
	eleventyConfig.addPassthroughCopy("src/favicon.ico");
	eleventyConfig.addPassthroughCopy(".nojekyll");
	eleventyConfig.addPassthroughCopy("CNAME");
	eleventyConfig.addPassthroughCopy("src/img/");

	eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
	// https://www.11ty.dev/docs/plugins/rss/
	//eleventyConfig.addPlugin(pluginRss);
	let markdownItOptions = {
		html: true,
	};
	let milaOptions = [
		{
			matcher(href) {
				return href.match(/^https?:\/\//);
			},
			attrs: {
				class: "external-link",
				target: "_blank",
			},
		},
	];
	let markdownLib = markdownIt(markdownItOptions).use(mila, milaOptions);
	//		.use(require("markdown-it-github-headings"));
	eleventyConfig.setLibrary("md", markdownLib);
	function filterTagList(tags) {
		return (tags || []).filter(
			(tag) =>
				["all", "nav", "post", "posts", "projects"].indexOf(tag) === -1
		);
	}

	let categoryMaker = function (collection) {
		let categorized = collection
			.getAll()
			.filter((item) => item.data.category);
		var categories = new Set();
		categorized.forEach((item) => {
			categories.add(`topic-${item.data.category}`);
		});
		console.log("categories", categories);
		console.log("categorized", categorized);
		var categoryObjects = {};
		categories.forEach((item) => {
			//eleventyConfig.addCollection(
			let key = item;
			categoryObjects[key] = categorized.filter(
				(p) => `topic-${p.data.category}` === item
			);
			// console.log("category", key, categoryObjects[key]);
			//);
		});
		console.log("categoryObjects", categoryObjects);
		return {
			categories: [...categories],
			// categorySets: categorySets,
			categoryObjects: categoryObjects,
		};
	};

	eleventyConfig.addCollection("categories", (collection) => {
		let { categories } = categoryMaker(collection);

		return categories;
	});

	eleventyConfig.addCollection("categoryObjects", (collection) => {
		let { categoryObjects } = categoryMaker(collection);
		return categoryObjects;
	});

	eleventyConfig.addFilter("filterTagList", filterTagList);

	eleventyConfig.addPlugin(
		require("@photogabble/eleventy-plugin-interlinker"),
		{
			defaultLayout: "layouts/embed.liquid",
		}
	);

	const paginate = (arr, size) => {
		return arr.reduce((acc, val, i) => {
			let idx = Math.floor(i / size);
			let page = acc[idx] || (acc[idx] = []);
			page.push(val);

			return acc;
		}, []);
	};

	let tagSet = new Set();
	let tagList = [];

	getAllTags = (allPosts) => {
		allPosts.forEach((item) => {
			if ("tags" in item.data) {
				let tags = filterTagList(item.data.tags);
				// console.log("Tags:", tags);
				tags.forEach((tag) => {
					if (tag && typeof tag !== "undefined") {
						tagSet.add(tag);
					} else {
						console.error("Tag is undefined", item.title);
					}
				});
			}
		});
		tagList = [...tagSet];
		return tagList;
	};

	const makePageObject = (tagName, slug, number, posts, first, last) => {
		//console.log(tagName, slug, number, first, last);
		if (!tagName) {
			console.error("tagName is undefined in makePageObject", tagName);
			return;
		}
		if (!slug) {
			/*console.log(
				slug,
				"slug is undefined in makePageObject, slugify",
				tagName
			);*/
			slug = slugify(tagName, {
				lower: true,
				strict: true,
				locale: "en",
			});
		}
		return {
			tagName: tagName,
			slug: slug,
			number: number,
			posts: posts,
			first: first,
			last: last,
		};
	};

	const getPostClusters = (
		allPosts,
		tagName,
		slug,
		controlSort,
		reversePerPage
	) => {
		aSet = new Set();
		if (controlSort) {
			aSet = [...allPosts];
		} else {
			let postArray = allPosts.reverse();
			aSet = [...postArray];
		}

		postArray = paginate(aSet, 20);
		let paginatedPostArray = [];
		postArray.forEach((p, i) => {
			if (reversePerPage) {
				p = p.reverse();
			}
			paginatedPostArray.push(
				makePageObject(
					tagName,
					slug,
					i + 1,
					p,
					i === 0,
					i === postArray.length - 1
				)
			);
		});
		// console.log(paginatedPostArray)
		return paginatedPostArray;
	};

	eleventyConfig.addCollection("tagList", (collection) => {
		return getAllTags(collection.getAll());
	});

	// Create a list of posts by tag for paged lists
	eleventyConfig.addCollection("deepTagList", (collection) => {
		const maxPostsPerPage = 20;
		const pagedPosts = [];
		tagList = getAllTags(collection.getAll());
		let dupedPages = [];
		tagList.forEach((tagName) => {
			if (!tagName) {
				console.error("tagName is undefined in deepTagList", tagName);
				return;
			}
			tagName = `${tagName}`.trim(); // Convert numbers to strings
			let capCheck = tagName.split("");
			let tagNameCapitalized = capCheck.reduce((acc, val, i) => {
				if (i === 1) {
					return acc.toUpperCase() + val;
				} else {
					return acc + val;
				}
			});
			tagName = tagNameCapitalized;
			let taggedPosts = [
				...collection.getFilteredByTag(tagName),
				...collection.getFilteredByTag(tagName.toLowerCase()),
				...collection.getFilteredByTag(tagName.toUpperCase()),
				...collection.getFilteredByTag(tagNameCapitalized),
				...collection.getFilteredByTag(
					slugify(tagName, {
						lower: true,
						strict: true,
						locale: "en",
					})
				),
				...collection.getFilteredByTag(
					slugify(tagName, {
						lower: true,
						strict: false,
						locale: "en",
					})
				),
				...collection.getFilteredByTag(
					slugify(tagName, {
						lower: false,
						strict: false,
						locale: "en",
					})
				),
				...collection.getFilteredByTag(
					slugify(tagName, {
						lower: false,
						strict: true,
						locale: "en",
					})
				),
			].reverse();
			let uniqueTaggedPosts = new Set(taggedPosts);
			taggedPosts = [...uniqueTaggedPosts];
			const numberOfPages = Math.ceil(
				taggedPosts.length / maxPostsPerPage
			);
			// console.log("Need to create a slug for:", tagName);
			let slug = slugify(tagName, {
				lower: true,
				strict: true,
				locale: "en",
			});
			if (slug.length > 30) {
				console.log("long slug", tagName, "into", slug);
			}
			// console.log("paged posts slug", slug);
			let dupedTag = false;
			if (pagedPosts.find((postsObj) => postsObj.slug === slug)) {
				console.error(`Tag ${tagName} has duplicate slug`, slug);
				dupedTag = true;
			}
			for (let pageNum = 1; pageNum <= numberOfPages; pageNum++) {
				const sliceFrom = (pageNum - 1) * maxPostsPerPage;
				const sliceTo = sliceFrom + maxPostsPerPage;
				let pageObj = makePageObject(
					tagName,
					slug,
					pageNum,
					taggedPosts.slice(sliceFrom, sliceTo),
					pageNum === 1,
					pageNum === numberOfPages
				);
				if (!dupedTag) {
					try {
						let matchedPages = pagedPosts.find(
							(postsObj) => postsObj?.slug === slug
						);
						if (
							matchedPages &&
							matchedPages.length >= pageObj.number
						) {
							pageObj.number = matchedPages.length + 1;
							console.error(
								`Tag ${tagName} has a previously duplicate slug`,
								slug,
								`changing from ${pageNum} to ${pageObj.number}`
							);
						}
					} catch (e) {
						console.log("!!! Duped page check has gone wrong", e);
					}
					pageObj.posts.reverse();
					pagedPosts.push(pageObj);
				} else {
					dupedPages.push(pageObj);
				}
			}
		});

		if (dupedPages.length) {
			dupedPages.forEach((pageObj) => {
				return;
				let c = 1;
				let slug = pageObj.slug;
				let tagName = pageObj.tagName;
				let pageNumber = 1;
				let aSet = pagedPosts.find((postsObj) => {
					if (
						postsObj.slug === slug &&
						// postsObj.number === c &&
						postsObj.posts.length < maxPostsPerPage
					) {
						c++;
						return true;
					} else {
						return false;
					}
				});
				if (aSet) {
					console.log(
						`Duplicate slug ${slug} from ${tagName} on ${pageObj.pageNum} found potential matching page`, //,
						`${aSet.tagName} with slug ${aSet.slug} and page number ${aSet.number} with ${aSet.posts.length} posts`
					);
					if (
						maxPostsPerPage >=
						aSet.posts.length + pageObj.posts.length
					) {
						let postsSet = new Set([
							...aSet.posts,
							...pageObj.posts,
						]);
						aSet.posts = [...postsSet];
						console.log(
							`Duplicate slug ${slug} from ${tagName} placed in with page`, //,
							`${aSet.tagName} with slug ${aSet.slug} and page number ${aSet.number}`
						);
					} else {
						console.log(
							"!! page split",
							`${aSet.tagName} with slug ${aSet.slug} and page number ${aSet.number}`
						);
						pageObj.number = c;
						pagedPosts.push(pageObj);
						console.log(
							"!! page split",
							`Duplicate slug ${slug} from ${tagName} placed in a new page`,
							pageObj
						);
					}
				} else {
					pageObj.number = ++c;
					pagedPosts.push(pageObj);
					dupedTag = false;
					console.log(
						`Duplicate slug ${slug} from ${tagName} on page ${pageObj.pageNum} placed in a new page`,
						pageObj
					);
				}
			});
		}
		console.log(
			"pagedPosts electronic check pages",
			pagedPosts.filter((pO) => pO.slug === "electronic")
		);
		console.log("pagedPosts total pages", pagedPosts.length);
		return pagedPosts;
	});

	eleventyConfig.addPlugin(
		require("@photogabble/eleventy-plugin-interlinker"),
		{
			defaultLayout: "layouts/embed.liquid",
		}
	);

	/*eleventyConfig.addPlugin(require("eleventy-plugin-dart-sass"), {
		sassLocation: path.join(path.resolve("."), "src/_sass/"),
		perTemplateFiles: "template-",
		outDir: path.join(path.resolve("."), "docs"),
		domainName: site,
	});*/

	var siteConfiguration = {
		// Control which files Eleventy will process
		// e.g.: *.md, *.njk, *.html
		// templateFormats: ["md", "njk", "html"],

		// -----------------------------------------------------------------
		// If your site deploys to a subdirectory, change `pathPrefix`.
		// Don’t worry about leading and trailing slashes, we normalize these.

		// If you don’t have a subdirectory, use "" or "/" (they do the same thing)
		// This is only used for link URLs (it does not affect your file structure)
		// Best paired with the `url` filter: https://www.11ty.dev/docs/filters/url/

		// You can also pass this in on the command line using `--pathprefix`

		// Optional
		pathPrefix: "/",
		// -----------------------------------------------------------------

		// Pre-process *.md files with: (default: `liquid`)
		// markdownTemplateEngine: "njk",

		// Pre-process *.html files with: (default: `liquid`)
		// htmlTemplateEngine: "njk",

		// Opt-out of pre-processing global data JSON files: (default: `liquid`)
		dataTemplateEngine: false,

		// These are all optional (defaults are shown):
		dir: {
			input: "src",
			includes: "_includes",
			// layouts: "_layouts",
			data: "_data",
			output: "docs",
		},
	};

	// pagefind search
	eleventyConfig.on("eleventy.after", () => {
		// console.log("After Eleventy", eleventyConfig);
		//console.log("indexing search using pagefind");
		//execSync(`npx pagefind --source _site --glob \"[0-9]*/**/*.html\"`, {
		//	encoding: "utf-8",
		//});
	});

	return siteConfiguration;
};
