//this will be from the user and not hard coded


async function checkCurrent(currentUrl, id) {
    console.log("checking websit ...")
    const data = await chrome.storage.local.get(["bannedSites"]) ?? []
    const bannedUrls = await data.bannedSites
    if (bannedUrls.indexOf(currentUrl) != -1) {
        console.log("banned website")
        chrome.storage.local.get(["timeLeft"]).then(data => {
            if (data.timeLeft && data.timeLeft > 0) {
                console.log("time left ==", data.timeLeft)
                const intervaleId = setInterval(() => {
                    console.log(data.timeLeft)
                    chrome.tabs.query({ active: true, highlighted: true }).then(tabs => {
                        if (tabs[0].id == id) {
                            data.timeLeft--
                            chrome.storage.local.set({ "timeLeft": data.timeLeft })
                        }
                    })
                    if (data.timeLeft <= 0) {
                        chrome.tabs.remove(id, () => {
                            console.log('')
                        })
                        clearInterval(intervaleId)
                    }
                }, 60000)
            } else {
                chrome.tabs.remove(id, () => {
                    console.log('')
                })
            }
        })
    }
}


chrome.tabs.onCreated.addListener(function (tab) {
    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, updatedTab) {
        if (changeInfo.status == "loading" && changeInfo.url) {

            checkCurrent(changeInfo.url, tabId)
        }


    });
});

chrome.windows.onCreated.addListener(function () {
    const date = new Date()
    const today = date.getDay().toString() + date.getFullYear().toString()
    chrome.storage.local.get(["lastDate"])
        .then(data => {
            if (data.lastDate != today) {
                //this reset the timer evrey day
                chrome.storage.local.set({ "lastDate": today }).then(data => console.log("updated lastDate"))
                chrome.storage.local.get(["timeLimit"]).then(data => {
                    const timeLimit = data.timeLimit ?? 60
                    chrome.storage.local.set({ "timeLeft": timeLimit }).then(data => console.log("reseted time left "))
                })
            }

        })
})