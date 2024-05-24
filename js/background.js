// Tags to look for and scrub out of URL
const remove_params = ['tag', 'ascsubtag', 'btn_ref', 'btn_url'];

function isURL(str) {
  try {
    new URL(decodeURIComponent(str));
    return true;
  } catch (e) {
    return false;
  }
}

function scrubURL(url) {
  // Decode the URL if it's HTTP Encoded
  const decoded_url = decodeURIComponent(url);

  let url_obj = new URL(decoded_url);
  let params = url_obj.searchParams;
  let better_url = decoded_url;
  
  // Check the value of each parameter to see if there's a secret embedded url anywhere
  // If so, we probably want that.
  for (let param of params) {
    if (isURL(param[1])) {
      better_url = param[1];
      break;
    }
  }

  // Whatever we have left, let's strip out all known garbage parameters from remove_params
  better_url = remove_params.reduce((acc, key) => {
      return acc.replace(new RegExp(`${key}=[^&]*&?`, 'g'), '');
  }, better_url);

  // If the url ends with a hanging ? or &, strip it off
  if (better_url.endsWith('?') || better_url.endsWith('&')) {
      better_url = better_url.slice(0, -1);
  }


  return better_url;
}

function scrubbedLinkCopy(text) {
  navigator.clipboard.writeText(text);
}


// Function to handle the context menu item click
function clickURL(info, tab) {

  //Scrub and gather the URL
  const scrubbed_url = scrubURL(info.linkUrl);

  // Execute the scrubbedLinkCopy script in the tab itself
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: scrubbedLinkCopy,
    args: [scrubbed_url],
  });
}

// Create the context menu item
chrome.contextMenus.create({
  id: "copy-scrubbed-url",
  title: "Copy Scrubbed URL",
  contexts: ["link"],
});

// Create the context menu item onclick listener
chrome.contextMenus.onClicked.addListener(clickURL);