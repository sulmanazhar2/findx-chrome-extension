// Both the toolbar icon click AND Cmd+Shift+F / Ctrl+Shift+F fire chrome.action.onClicked
// because the manifest command is named "_execute_action" (Chrome reserved name).
// No separate onCommand listener needed.

async function injectAndToggle(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js'],
    });
  } catch (e) {
    return; // chrome://, file://, etc.
  }
  try {
    await chrome.tabs.sendMessage(tabId, { action: 'toggle' });
  } catch (e) {
    // ignore
  }
}

if (chrome.action && chrome.action.onClicked) {
  chrome.action.onClicked.addListener(async (tab) => {
    if (tab && tab.id) {
      await injectAndToggle(tab.id);
    }
  });
}
