const http = {
	apiKey: "cf912e30-3a08-4e52-b372-0ef351408f27",
	get: url => {
		return url && fetch(url, {
			method: "GET",
			headers: new Headers({
				"Content-type": "application/json",
				"X-AUTH-TOKEN": http.apiKey,
			}),
		}).then(
			res => res.json()
		).catch(
			err => console.warn("ERROR for " + url, err)
		);
	},
	post: (url, data) => {
		return url && fetch(url, {
			method: "POST",
			body: JSON.stringify(data),
			headers: new Headers({
				"Content-type": "application/json",
				"X-AUTH-TOKEN": http.apiKey,
			}),
		}).then(
			res => res.json()
		).catch(
			err => console.warn("ERROR for " + url, err)
		);
	},
	// get the id of an object from an url
	getId: url => url && url.split("/").pop().replace(/\?.*$/, "").replace(/\.\w+$/, ""),
	// get the url to a thubmnail (should be used with a file url)
	thumbnail: (url, width, height) => url && "/api/images/thumbnail/" + width + "/" + height + "/" + http.getId(url),
	// same as http.thumbnail but for a crop
	crop: (url, width, height) => url && "/api/images/crop/" + width + "/" + height + "/" + http.getId(url),
};
export default http;
