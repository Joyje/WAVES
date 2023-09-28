	// When the user clicks, toggle between hiding and showing the dropdown
function showAlt(element) {
	element.nextElementSibling.classList.toggle("show");
}
	// Close some of the dropdown menus when the user clicks
window.onclick = function(event) {
	if (!event.target.matches('.dropbtn')) {
		let dropdowns = document.getElementsByClassName("coc");
		for (let i = 0; i < dropdowns.length; i++) {
			let openDropdown = dropdowns[i];
			if (openDropdown.classList.contains('show')) {
				openDropdown.classList.remove('show');
			}
		}
	}
}

