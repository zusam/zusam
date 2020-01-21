import lang from "./lang.js";
import router from "./router.js";

const util = {
  urlRegExp: new RegExp(
    "(\\([^()]*)?https?:\\/\\/[-A-Za-z0-9+&@#/%?=~_()|!:,.;*]*[-A-Za-z0-9+&@#/%=~_()|]",
    "i"
  ),
  getUrl: txt => {
    if (!txt) {
      return "";
    }
    let url = txt.match(util.urlRegExp);
    if (url && url[0].startsWith("(")) {
      let link = url[0].match(/https?:\/\//i);
      url["index"] += link["index"];
      url[0] = url[0].slice(link["index"]);
      if (url[0].endsWith(")")) {
        url[0] = url[0].slice(0, -1);
      }
    }
    return url;
  },
  // full datetime as a string adapted to the users timezone
  humanFullDate: timestamp => {
    let d = new Date(timestamp * 1000);
    d = new Date(d.getTime() + d.getTimezoneOffset() * 60000 * -1);
    return d
      .toISOString()
      .replace("T", " ")
      .replace(/\..*$/, "");
  },
  // duration relative to event
  humanTime: timestamp => {
    if (!timestamp) {
      return null;
    }
    const duration = Math.abs(Math.round((Date.now() / 1000 - timestamp) / 60));
    if (duration < 1) {
      return lang.t("just_now");
    }
    if (duration < 60) {
      return lang.t("ago", { duration: duration + "mn" });
    }
    if (duration < 60 * 24) {
      return lang.t("ago", { duration: Math.floor(duration / 60) + "h" });
    }
    let date = new Date(timestamp * 1000);
    return util.humanFullDate(timestamp).split(" ")[0];
  },
  // get the id of an object from an url
  getId: e => {
    switch (typeof e) {
      case "object":
        return e ? e.id : null;
      case "string":
        return e
          .split("/")
          .pop()
          .replace(/\?.*$/, "")
          .replace(/\.\w+$/, "");
    }
    console.warn(e);
    throw "Could not extract id !";
  },
  // get the url to a thubmnail
  thumbnail: (id, width, height) =>
    id
      ? router.toApp("/api/images/thumbnail/" + width + "/" + height + "/" + id)
      : null,
  // same as http.thumbnail but for a crop
  crop: (id, width, height) =>
    id
      ? router.toApp("/api/images/crop/" + width + "/" + height + "/" + id)
      : null,
  // default avatar in base64
  defaultAvatar:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAI4AAACOAQMAAADdM6JLAAAABlBMVEUAAAD///+l2Z/dAAAAAnRSTlMA+1z85qwAAADgSURBVEjH7dUxDoIwGAXgRxxIdOAIXMONo3AFD2BSbyZHcHHnCI4dkOcAxLYPkKDGmPQfv6T8/cujALFi/XntlY5KrRJFEtYAgJ1LLQCUrBwiryUZEEn261fQ7X3CDNWzZJQKpVwp6+l5EkiVhr2eIC3d0+9W+i9qeyZp/be08Ucc9lH5lAcN+5nCDJBNmAFpmPpDTzQceboJxwEWjTPR8LSk4etxfnJ+AWYSpSFeFhpCzY27NaOJM9OxH/k4rFKzltrvkFlEBe8ASpfyS/fIRi67TCkZIasX5yH+dGJ9th7sZ6igNEF8KgAAAABJRU5ErkJggg==",
  hash: str =>
    str.split("").reduce((a, c) => ((a << 5) - a + c.charCodeAt()) | 0),
  colorHash: str =>
    [
      "018E42",
      "084887",
      "0F4C5C",
      "221E22",
      "255957",
      "32936F",
      "437C90",
      "454E9E",
      "5F04F0",
      "7FB800",
      "9A031E",
      "A4036F",
      "B26700",
      "B87C14",
      "BF1A2F",
      "C30909",
      "DE1A1A",
      "DE9518",
      "EE4266",
      "F00699",
      "F17105",
      "F6511D",
      "F7A71B",
      "F9C366"
    ][Math.abs(util.hash(str)) % 24]
};
export default util;
