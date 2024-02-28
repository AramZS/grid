module.exports = function (data, localLink, content, classNames) {
	let link = `${data.site.domain}${localLink}`; // hx-get="${link}"
	classNames = classNames ? classNames : "htmx-made-link";
	return /*html*/ `
	<a href="${link}" class="${classNames}">${content}</a>
	`;
};
