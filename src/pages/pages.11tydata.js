// Chaque page utilise le modèle indiqué dans son champ « modele ».
export default {
	eleventyComputed: {
		layout: (data) => `modeles/${data.modele || "page"}.njk`,
		permalink: (data) => (data.page.fileSlug === "accueil" ? "/" : `/${data.page.fileSlug}/`),
		title: (data) => data.titre,
	},
};
