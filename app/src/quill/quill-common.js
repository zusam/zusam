function parseJson (jsonString){
  try {
    let o = JSON.parse(jsonString);
    if (o && typeof o === "object") {
      return o; 
    }
  }
  catch (e) { }

  return false;
};

export function parseMessage(message) {
  let type, delta, textOnly;
  let parsed = parseJson(message.data.text);
  if (parsed) {
    delta = parsed?.delta ?? null;
    textOnly = parsed?.textOnly ?? "";
    type = parsed?.type ?? "standard";
  } else {
    delta = null;
    textOnly = message.data.text ?? "";
    type = "standard";
  }

  return {
    "type": type,
    "text": textOnly,
    "delta": delta
  };
}