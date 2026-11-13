/* Ouverture du menu sur petit écran. */
(function () {
	var bouton = document.querySelector('.entete__bouton');
	var nav = document.getElementById('menu-principal');
	if (!bouton || !nav) { return; }
	bouton.addEventListener('click', function () {
		var ouvert = bouton.getAttribute('aria-expanded') === 'true';
		bouton.setAttribute('aria-expanded', ouvert ? 'false' : 'true');
		nav.classList.toggle('est-ouvert', !ouvert);
	});
	document.addEventListener('keydown', function (e) {
		if (e.key === 'Escape' && nav.classList.contains('est-ouvert')) {
			bouton.setAttribute('aria-expanded', 'false');
			nav.classList.remove('est-ouvert');
			bouton.focus();
		}
	});
})();
