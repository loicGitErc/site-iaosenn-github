// Une page par référence : /reference/nom-du-projet/
export default {
	layout: "modeles/reference.njk",
	permalink: (data) => `/reference/${data.page.fileSlug}/`,
	eleventyComputed: { title: (data) => data.titre },
};
