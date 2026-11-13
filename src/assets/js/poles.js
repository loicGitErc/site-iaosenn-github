/* Nos pôles : un clic sur une icône affiche les métiers du pôle. Sans JavaScript, tous les pôles restent affichés. */
(function () {
	var bloc = document.getElementById('poles');
	if (!bloc) { return; }
	var boutons = bloc.querySelectorAll('.pole');
	var panneaux = bloc.querySelectorAll('.pole-panneau');
	bloc.classList.add('poles--actif');

	function ouvrir(id, deplacer) {
		var trouve = false;
		Array.prototype.forEach.call(panneaux, function (p) {
			var ok = p.id === id;
			p.hidden = !ok;
			if (ok) { trouve = true; if (deplacer) { p.focus({ preventScroll: true }); p.scrollIntoView({ block: 'nearest' }); } }
		});
		Array.prototype.forEach.call(boutons, function (b) {
			var ok = b.getAttribute('data-pole') === id;
			b.setAttribute('aria-expanded', ok ? 'true' : 'false');
			b.classList.toggle('pole--ouvert', ok);
		});
		return trouve;
	}

	Array.prototype.forEach.call(boutons, function (b) {
		b.setAttribute('role', 'button');
		b.setAttribute('aria-controls', b.getAttribute('data-pole'));
		b.addEventListener('click', function (e) {
			e.preventDefault();
			var id = b.getAttribute('data-pole');
			var dejaOuvert = b.getAttribute('aria-expanded') === 'true';
			ouvrir(dejaOuvert ? '' : id, !dejaOuvert);
			if (window.history && history.replaceState) { history.replaceState(null, '', dejaOuvert ? location.pathname : '#' + id); }
		});
		b.addEventListener('keydown', function (e) { if (e.key === ' ') { e.preventDefault(); b.click(); } });
	});
	ouvrir(location.hash ? location.hash.slice(1) : '', false);
})();
