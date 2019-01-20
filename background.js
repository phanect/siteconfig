
const langageToSet = "ja";

browser.webRequest.onBeforeSendHeaders.addListener((e) => {
  if (!e.documentUrl && !e.url) {
    throw new Error("Unexpected error occured.");
  }

  // URL for the parent HTML.
  // If this is the request for the parent HTML, its URL is stored in e.url and e.documentUrl == undefined.
  // If this is the request for the resource files (i.e. image, CSS, JS, etc), the parent HTML's URL is stored in e.documentUrl
  const documentUrl = new URL(e.documentUrl || e.url);
  let res = { requestHeaders: e.requestHeaders };

  if (
    // Niconico
    (documentUrl.hostname.endsWith("nicovideo.jp")) ||
    // Google Maps
    (
      documentUrl.hostname.endsWith("google.com") &&
      documentUrl.pathname.startsWith("/maps")
    )
  ) {
    const acceptLanguageIndex = e.requestHeaders
      .findIndex(header => header.name.toLowerCase() === "accept-language")

    res.requestHeaders[acceptLanguageIndex].value = langageToSet;
  }

  // Processing Google's "hl" GET parameter
  if (e.url) {
    const url = new URL(e.url);

    if (url.hostname.endsWith("google.com")) {
      const params = new URLSearchParams(url.search);

      if (params.get("hl")) {
        params.set("hl", langageToSet);
        res.redirectUrl = url.origin + url.pathname + "?" + params.toString();
      }
    }
  }

  return res;
}, { urls: [ "<all_urls>" ]}, [ "blocking", "requestHeaders" ]);
