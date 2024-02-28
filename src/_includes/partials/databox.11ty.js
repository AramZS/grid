module.exports = function (data, postObj) {
	let status = "";
	if (postObj.data.status) {
		status = `<p class="status">${postObj.data.status}</p>`;
	}

	return /*html*/ `
<div class="data-box">
	<h3>
		${postObj.data.title}
	</h3>
	<span class="close">X</span>
	<div class="data-box__inner__text data-box__inner">
		<p class="brief">
			${postObj.data.brief}
		</p>
		
		${status}
		
		${postObj.content}
	</div>
</div>
`;
};
