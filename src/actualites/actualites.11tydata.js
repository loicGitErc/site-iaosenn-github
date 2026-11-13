// Une page par actualité : /actualites/titre-de-l-actualite/
export default {
	layout: "modeles/actualite.njk",
	permalink: (data) => `/actualites/${data.page.fileSlug}/`,
	eleventyComputed: { title: (data) => data.titre },
};
