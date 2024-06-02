module.exports = function (data, title, itemCount, tags, databoxes) {
	return /*html*/ `
<section class="gridbox box"  data-augmented-ui>
  <div class="gridbox-inner">
    <div class="general-tags">
      <span>${tags}</span>
    </div>
    <h2>
    ${title}: <span class="header-count">${itemCount} items</span>
    </h2>
    <div data-augmented-ui-reset class="data-box-collection item-collection">
      ${databoxes}
    </div>
  </div>
        <div class="gridbox-controls">
          <button class="back" onclick="(function(e){bkClick(e)})(this)">
            <span class="glitch" data-text="&lt; Bkwd">&lt; Bkwd</span>
          </button>
          <div class="gridbox-controls__count">

          </div>
          <button class="forward" onclick="(function(e){fwdClick(e)})(this)">
            <span class="glitch" data-text="Fwd &gt;">Fwd &gt;</span>
          </button>
        </div>
</section>
`;
};
