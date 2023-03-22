async function checkCurrent(currentUrl, id) {
    const data = await chrome.storage.local.get(["bannedSites"]) ?? []
    const bannedUrls = await data.bannedSites
    if (bannedUrls.indexOf(currentUrl) != -1) {

        console.log(id)
        chrome.tabs.remove(id, () => {
            console.log('')
        })

    }
}


chrome.tabs.onCreated.addListener(function (tab) {
    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, updatedTab) {
        checkCurrent(updatedTab.url, tabId)
        console.log(tabId)
    });
});
