/* Carte des références.
   - Références détaillées : points gris, verts quand le projet correspond aux types cochés. Un clic ouvre la fiche.
   - Dossiers par commune : un point par commune, portant le nombre de dossiers. Un clic les déploie autour du point.
   - Fond : principaux cours d'eau (tracé schématique) et principales villes. */
(function () {
	var conf = window.iaoCarte || {};
	var donnees = conf.references || [];
	var communes = conf.communes || [];
	var fond = conf.fond || {};
	var vert = conf.vert || '#72AF2D';
	var formulaire = document.getElementById('filtres-carte');
	var compteur = document.getElementById('compteur-carte');
	var detail = document.getElementById('detail-commune');
	var lignes = document.querySelectorAll('#liste-references .reference');
	var zone = document.getElementById('carte-references');
	if (!formulaire || !zone) { return; }

	var points = [];
	var carte = null;
	var eclat = null;
	var communeOuverte = null;
	var totalDossiers = communes.reduce(function (n, c) { return n + c.dossiers.length; }, 0);

	function texte(balise, contenu, classe) {
		var e = document.createElement(balise);
		e.textContent = contenu;
		if (classe) { e.className = classe; }
		return e;
	}

	function echapper(t) {
		return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
	}

	function tailleCommune(n) { return n >= 30 ? 34 : n >= 10 ? 30 : n >= 4 ? 26 : 22; }

	// Adoucit un tracé schématique (courbe passant par tous les points).
	function adoucir(pts) {
		if (pts.length < 3) { return pts; }
		var res = [], i, t;
		for (i = 0; i < pts.length - 1; i++) {
			var p0 = pts[Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(i + 2, pts.length - 1)];
			for (t = 0; t < 1; t += 0.125) {
				var t2 = t * t, t3 = t2 * t;
				res.push([0, 1].map(function (k) {
					return 0.5 * (2 * p1[k] + (p2[k] - p0[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (3 * p1[k] - p0[k] - 3 * p2[k] + p3[k]) * t3);
				}));
			}
		}
		res.push(pts[pts.length - 1]);
		return res;
	}

	function fermer() {
		if (eclat) { eclat.clearLayers(); }
		communeOuverte = null;
		zone.classList.remove('carte--deployee');
		if (detail) { detail.hidden = true; detail.textContent = ''; }
	}

	// Déploie les dossiers d'une commune autour de son point, chacun relié au point par un trait.
	function deployer(c) {
		fermer();
		communeOuverte = c;
		zone.classList.add('carte--deployee');
		var centre = carte.latLngToContainerPoint([c.lat, c.lng]);
		var n = c.dossiers.length;
		var positions = [];
		var i, angle, rayon;
		if (n <= 10) {
			rayon = n === 1 ? 46 : 52 + n * 4;
			for (i = 0; i < n; i++) {
				angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
				positions.push([centre.x + rayon * Math.cos(angle), centre.y + rayon * Math.sin(angle)]);
			}
		} else {
			// Nombreux dossiers : couronnes concentriques.
			var reste = n, depart = 0;
			rayon = 56;
			while (reste > 0) {
				var places = Math.min(reste, Math.floor((2 * Math.PI * rayon) / 26));
				for (i = 0; i < places; i++) {
					angle = -Math.PI / 2 + depart + (2 * Math.PI * i) / places;
					positions.push([centre.x + rayon * Math.cos(angle), centre.y + rayon * Math.sin(angle)]);
				}
				reste -= places; rayon += 30; depart += 0.12;
			}
		}
		positions.forEach(function (p, k) {
			var ll = carte.containerPointToLatLng(L.point(p[0], p[1]));
			L.polyline([[c.lat, c.lng], ll], { color: '#6f6f6f', weight: 1.5, interactive: false, pane: 'eclat' }).addTo(eclat);
			var m = L.circleMarker(ll, { radius: 6, color: '#ffffff', weight: 2, fillColor: '#6f6f6f', fillOpacity: 1, pane: 'eclat' }).addTo(eclat);
			m.bindTooltip(c.dossiers[k], {
				permanent: n <= 8,
				direction: p[0] >= centre.x ? 'right' : 'left',
				offset: [p[0] >= centre.x ? 8 : -8, 0],
				className: 'etiquette-dossier'
			});
		});
		if (detail) {
			detail.hidden = false;
			detail.appendChild(texte('h3', c.nom + ' : ' + n + (n > 1 ? ' dossiers' : ' dossier'), 'carte__detail-titre'));
			var ul = document.createElement('ul');
			c.dossiers.forEach(function (d) { ul.appendChild(texte('li', d)); });
			detail.appendChild(ul);
		}
	}

	if (window.L) {
		carte = L.map(zone, { scrollWheelZoom: false });
		carte.createPane('fond').style.zIndex = 350;
		carte.createPane('communes').style.zIndex = 610;
		carte.createPane('references').style.zIndex = 620;
		carte.createPane('eclat').style.zIndex = 640;
		carte.getPane('tooltipPane').style.zIndex = 660;
		L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 18,
			className: 'fond-attenue',
			attribution: '&copy; contributeurs <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		}).addTo(carte);

		// Principaux cours d'eau et principales villes.
		var repere = L.layerGroup().addTo(carte);
		(fond.cours_eau || []).forEach(function (r) {
			if (!r.trace || r.trace.length < 2) { return; }
			L.polyline(adoucir(r.trace), { color: '#2f7fb8', weight: 2.5, opacity: 0.85, smoothFactor: 0, interactive: false, pane: 'fond', className: 'cours-eau' }).addTo(repere);
			var milieu = r.trace[Math.floor(r.trace.length / 2)];
			L.marker(milieu, { interactive: false, keyboard: false, pane: 'fond', icon: L.divIcon({ className: 'nom-eau', html: '<span>' + echapper(r.nom) + '</span>', iconSize: [0, 0] }) }).addTo(repere);
		});
		(fond.villes || []).forEach(function (v) {
			L.marker([v.lat, v.lng], { interactive: false, keyboard: false, pane: 'fond', icon: L.divIcon({ className: 'nom-ville', html: '<i></i><span>' + echapper(v.nom) + '</span>', iconSize: [0, 0] }) }).addTo(repere);
		});
		function ajusterFond() {
			var z = carte.getZoom();
			zone.classList.toggle('carte--proche', z >= 11);
			zone.classList.toggle('carte--loin', z <= 8);
		}
		carte.on('zoomend', ajusterFond);

		eclat = L.layerGroup().addTo(carte);
		var limites = [];

		// Un point par commune, avec le nombre de dossiers.
		communes.forEach(function (c) {
			var n = c.dossiers.length;
			var taille = tailleCommune(n);
			var m = L.marker([c.lat, c.lng], {
				pane: 'communes',
				title: c.nom + ' : ' + n + (n > 1 ? ' dossiers' : ' dossier'),
				alt: c.nom + ' : ' + n + (n > 1 ? ' dossiers' : ' dossier'),
				icon: L.divIcon({ className: 'point-commune', html: '<span class="point-commune__rond">' + n + '</span>', iconSize: [taille, taille] })
			}).addTo(carte);
			m.on('click', function (e) {
				L.DomEvent.stopPropagation(e);
				if (communeOuverte === c) { fermer(); return; }
				fermer();
				// Recentrer d'abord, pour que tous les dossiers tiennent dans la carte.
				var cible = L.latLng(c.lat, c.lng);
				if (carte.getCenter().distanceTo(cible) < 1) { deployer(c); return; }
				carte.once('moveend', function () { deployer(c); });
				carte.panTo(cible, { animate: true, duration: 0.3 });
			});
			limites.push([c.lat, c.lng]);
		});

		// Références détaillées. Quand une commune porte déjà un point numéroté, la référence est posée
		// en couronne autour de ce point (décalage en pixels) pour que les deux restent cliquables.
		var rangs = {};
		donnees.forEach(function (r) {
			if (r.lat === null || r.lng === null) { return; }
			var proche = null, ecart = 0.035;
			communes.forEach(function (c) {
				var d = Math.max(Math.abs(c.lat - r.lat), Math.abs(c.lng - r.lng) * 0.67);
				if (d < ecart) { ecart = d; proche = c; }
			});
			var position = proche ? [proche.lat, proche.lng] : [r.lat, r.lng];
			var cle = position.join(',');
			var k = rangs[cle] || 0;
			rangs[cle] = k + 1;
			var dx = 0, dy = 0;
			if (proche) {
				var rayon = tailleCommune(proche.dossiers.length) / 2 + 9;
				var angle = -Math.PI / 3 + k * (16 / rayon);
				dx = rayon * Math.cos(angle); dy = rayon * Math.sin(angle);
			} else if (k) {
				dx = k * 17;
			}
			var point = L.marker(position, {
				pane: 'references',
				alt: r.titre,
				icon: L.divIcon({ className: 'point-reference', iconSize: [16, 16], iconAnchor: [8 - dx, 8 - dy] })
			}).addTo(carte);
			point.bindTooltip(r.titre + (r.commune ? ' (' + r.commune + ')' : ''), { offset: [dx, dy - 6], direction: 'top' });
			point.on('click', function (e) { L.DomEvent.stopPropagation(e); window.location.href = r.url; });
			points.push({ ref: r, point: point });
			limites.push(position);
		});
		// Vue de départ : l'emprise des communes (la Bretagne). Sans dossier par commune, celle des références.
		var emprise = communes.length ? communes.map(function (c) { return [c.lat, c.lng]; }) : limites;
		if (emprise.length) {
			carte.fitBounds(emprise, { padding: [24, 24] });
		} else {
			carte.setView([48.1, -2.8], 8);
		}
		ajusterFond();
		carte.whenReady(function () { window.setTimeout(appliquer, 0); });
		carte.on('click', fermer);
		carte.on('zoomstart', fermer);
		document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { fermer(); } });
	}

	function selection() {
		return Array.prototype.map.call(formulaire.querySelectorAll('input[name="type"]:checked'), function (c) { return c.value; });
	}

	function correspond(types, choix) {
		return choix.some(function (c) { return types.indexOf(c) !== -1; });
	}

	function appliquer() {
		var choix = selection();
		var actif = choix.length > 0;
		var total = 0;
		points.forEach(function (p) {
			var ok = actif && correspond(p.ref.types, choix);
			var el = p.point.getElement && p.point.getElement();
			if (el) { el.classList.toggle('point-reference--vert', ok); }
			p.point.setZIndexOffset(ok ? 1000 : 0);
		});
		Array.prototype.forEach.call(lignes, function (li) {
			var types = (li.getAttribute('data-types') || '').split(' ');
			var ok = !actif || correspond(types, choix);
			li.hidden = !ok;
			if (ok) { total++; }
		});
		if (compteur) {
			compteur.textContent = actif
				? total + (total > 1 ? ' références correspondent' : ' référence correspond') + ' à la sélection.'
				: donnees.length + ' références détaillées et ' + totalDossiers + ' dossiers dans ' + communes.length + ' communes. Cliquer sur un point numéroté pour afficher les dossiers de la commune.';
		}
	}

	formulaire.addEventListener('change', appliquer);
	formulaire.addEventListener('reset', function () { window.setTimeout(appliquer, 0); });

	// Arrivée depuis une fiche ou un dossier : ?type=etude-impact coche le filtre.
	var voulu = new URLSearchParams(window.location.search).get('type');
	if (voulu) {
		var caseVoulue = formulaire.querySelector('input[value="' + voulu.replace(/[^a-z0-9\-]/g, '') + '"]');
		if (caseVoulue) { caseVoulue.checked = true; }
	}
	appliquer();
})();
