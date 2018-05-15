let http = {
	apiKey: "f759248b-de35-4cc0-ae4b-f37805f72a85",
	get: url => {
		return fetch(url, {
			method: "GET",
			headers: new Headers({
				"Content-type": "application/json",
				"X-AUTH-TOKEN": http.apiKey,
			}),
		}).then(
			res => res.json()
		).catch(
			err => console.warn(err)
		);
	},
	post: (url, data) => {
		return fetch(url, {
			method: "POST",
			body: JSON.stringify(data),
			headers: new Headers({
				"Content-type": "application/json",
				"X-AUTH-TOKEN": http.apiKey,
			}),
		}).then(
			res => res.json()
		).catch(
			err => console.warn(err)
		);
	},
	// get the id of an object from an url
	getId: url => url.split("/").pop().replace(/\?.*$/, "").replace(/\.\w+$/, ""),
	// get the url to a thubmnail (should be used with a file url)
	thumbnail: (url, width, height) => "/api/images/thumbnail/" + width + "/" + height + "/" + http.getId(url),
	// same as http.thumbnail but for a crop
	crop: (url, width, height) => "/api/images/crop/" + width + "/" + height + "/" + http.getId(url),
};
export default http;
