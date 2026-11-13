// Configuration du site statique iao senn (Eleventy).
// Le contenu se modifie dans l'interface /admin/ ; ce fichier n'a pas à être touché au quotidien.

import path from "node:path";
import fs from "node:fs";
import Image from "@11ty/eleventy-img";
import { HtmlBasePlugin } from "@11ty/eleventy";

// Préfixe d'adresse : « / » pour le site définitif, « /nom-du-depot/ » pour le test sur GitHub Pages
// (fourni automatiquement par la publication GitHub, variable PREFIXE).
const PREFIXE = process.env.PREFIXE || "/";
const avecPrefixe = (u) => (u && u.startsWith("/") ? PREFIXE.replace(/\/$/, "") + u : u);

const parOrdre = (a, b) =>
	(a.data.ordre ?? 999) - (b.data.ordre ?? 999) ||
	String(a.data.titre || a.data.nom).localeCompare(String(b.data.titre || b.data.nom), "fr");

export default function (eleventyConfig) {
	// Ajoute le préfixe aux liens, images et feuilles de style des pages.
	eleventyConfig.addPlugin(HtmlBasePlugin);
	eleventyConfig.setNunjucksEnvironmentOptions({ autoescape: true });
	eleventyConfig.addFilter("head", (liste, n) => (liste || []).slice(0, n));

	// Fichiers copiés tels quels.
	eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
	eleventyConfig.addPassthroughCopy({ "src/medias": "medias" });
	eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });

	// Collections : une par dossier de contenu.
	eleventyConfig.addCollection("equipe", (c) => c.getFilteredByGlob("src/equipe/*.md").sort(parOrdre));
	eleventyConfig.addCollection("metiers", (c) => c.getFilteredByGlob("src/metiers/*.md").sort(parOrdre));
	eleventyConfig.addCollection("dossiers", (c) => c.getFilteredByGlob("src/dossiers/*.md").sort(parOrdre));
	eleventyConfig.addCollection("poles", (c) => c.getFilteredByGlob("src/poles/*.md").sort(parOrdre));
	eleventyConfig.addCollection("references", (c) =>
		c.getFilteredByGlob("src/references/*.md").sort((a, b) => a.data.titre.localeCompare(b.data.titre, "fr"))
	);
	eleventyConfig.addCollection("actualites", (c) =>
		c.getFilteredByGlob("src/actualites/*.md").sort((a, b) => b.date - a.date)
	);

	// Position d'une référence : texte GeoJSON enregistré par l'interface (champ « carte »).
	const position = (valeur) => {
		if (!valeur) return null;
		try {
			const g = typeof valeur === "string" ? JSON.parse(valeur) : valeur;
			const [lng, lat] = g.coordinates;
			return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
		} catch {
			return null;
		}
	};

	// Données de la carte des références.
	eleventyConfig.addFilter("donneesCarte", (refs) =>
		refs.map((r) => {
			const p = position(r.data.position);
			return {
				titre: r.data.titre,
				url: avecPrefixe(r.url),
				commune: r.data.commune || "",
				lat: p ? p.lat : null,
				lng: p ? p.lng : null,
				types: r.data.types || [],
			};
		})
	);

	// Dossiers regroupés par commune (carte des références) : position lue, communes sans dossier écartées.
	eleventyConfig.addFilter("communesCarte", (communes) =>
		(communes || [])
			.map((c) => {
				const p = position(c.position);
				const dossiers = (c.dossiers || []).map((d) => (typeof d === "string" ? d : d && d.nom)).filter(Boolean);
				return p && dossiers.length ? { nom: c.nom, lat: p.lat, lng: p.lng, dossiers } : null;
			})
			.filter(Boolean)
	);
	eleventyConfig.addFilter("totalDossiers", (communes) => (communes || []).reduce((n, c) => n + c.dossiers.length, 0));
	// Fiches de définition rattachées à une rubrique de la page « Principaux dossiers ».
	eleventyConfig.addFilter("deRubrique", (fiches, id) => (fiches || []).filter((f) => (f.data.rubrique || "") === id));
	eleventyConfig.addFilter("sansRubrique", (fiches, rubriques) => {
		const ids = (rubriques || []).map((r) => r.id);
		return (fiches || []).filter((f) => !ids.includes(f.data.rubrique || ""));
	});

	// Noms des types de dossiers à partir de leurs identifiants.
	eleventyConfig.addFilter("nomsTypes", (ids, types) =>
		(ids || []).map((id) => (types.find((t) => t.id === id) || {}).nom).filter(Boolean)
	);
	// Types effectivement utilisés par au moins une référence, triés par ordre alphabétique.
	eleventyConfig.addFilter("typesUtilises", (types, refs) => {
		const utilises = new Set(refs.flatMap((r) => r.data.types || []));
		return types
			.filter((t) => utilises.has(t.id))
			.sort((a, b) => a.nom.localeCompare(b.nom, "fr", { sensitivity: "base" }));
	});

	eleventyConfig.addFilter("initiales", (nom) =>
		String(nom || "")
			.split(/[\s-]+/)
			.filter(Boolean)
			.map((m) => m[0].toUpperCase())
			.join("")
			.slice(0, 3)
	);
	eleventyConfig.addFilter("dateFr", (d) =>
		new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
	);
	eleventyConfig.addFilter("dateIso", (d) => new Date(d).toISOString());
	eleventyConfig.addFilter("telephone", (t) => String(t || "").replace(/[^0-9+]/g, ""));
	eleventyConfig.addFilter("lignes", (t) => String(t || "").split("\n"));
	eleventyConfig.addFilter("annee", () => new Date().getFullYear());
	eleventyConfig.addFilter("courant", (url, lien) =>
		url === lien ||
		(lien === "/references/" && url.startsWith("/reference/")) ||
		(lien !== "/" && url.startsWith(lien))
	);

	// Vrai si l'image indiquée existe dans src/medias.
	eleventyConfig.addFilter("existe", (src) => !!src && fs.existsSync(path.join("src", String(src).replace(/^\/+/, ""))));

	// Photos : réduites et converties automatiquement à la publication.
	eleventyConfig.addAsyncShortcode("image", async (src, alt, largeurs = [400, 800], tailles = "(max-width: 760px) 100vw, 400px") => {
		if (!src) return "";
		const fichier = path.join("src", String(src).replace(/^\/+/, ""));
		if (!fs.existsSync(fichier)) return "";
		const meta = await Image(fichier, {
			widths: largeurs,
			formats: ["webp", "jpeg"],
			outputDir: "_site/medias/optimisees/",
			urlPath: "/medias/optimisees/",
		});
		return Image.generateHTML(meta, { alt: alt || "", sizes: tailles, loading: "lazy", decoding: "async" });
	});

	return {
		pathPrefix: PREFIXE,
		dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
		markdownTemplateEngine: false,
		htmlTemplateEngine: "njk",
		templateFormats: ["md", "njk"],
	};
}
