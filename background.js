
//will run when user open his browser
chrome.tabs.onCreated.addListener(function (tab) {
    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, updatedTab) {
        if (changeInfo.status == "loading" && changeInfo.url) {
            checkCurrent(changeInfo.url, tabId)
            console.log("checking")
        }
    });
});

//will run when a new tab is created
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

function extractDomainName(url) {
    // Remove any protocol and www from the URL
    let domain = url.replace(/(^\w+:|^)\/\/(www\.)?/, '');

    // Remove any path or query parameters
    domain = domain.split('/')[0];

    return domain;
}

function isBanned(url, bannedUrls) {
    let banned = false

    bannedUrls.forEach(element => {
        if (extractDomainName(url) === element) {
            banned = true
        }
    });
    return banned

}
//checking current website is banned and starting the time if it is
async function checkCurrent(currentUrl, id) {
    const data = await chrome.storage.local.get(["bannedSites"]) ?? []
    const bannedUrls = await data.bannedSites
    if (isBanned(currentUrl, bannedUrls)) {
        //starting timer or closing the tab
        chrome.storage.local.get(["timeLeft"]).then(data => {
            if (data.timeLeft && data.timeLeft > 0) {
                const intervaleId = setInterval(() => {
                    chrome.tabs.query({ active: true, highlighted: true }).then(tabs => {
                        if (tabs[0].id == id && isBanned(tabs[0].url, bannedUrls)) {
                            data.timeLeft--
                            chrome.storage.local.set({ "timeLeft": data.timeLeft })
                        }
                    })
                    if (data.timeLeft <= 2) {
                        try {
                            chrome.tabs.remove(id, () => {
                                console.log('')
                            })
                            clearInterval(intervaleId)
                        } catch (err) { clearInterval(intervaleId) }

                    }
                }, 60000)
            } else {
                try {
                    chrome.tabs.remove(id, () => {
                        console.log('')
                    })
                } catch (error) { }
            }
        })
    }
}
chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (let key in changes) {
        if (key === "bannedSites") {
            chrome.tabs.query({ active: true }).then(data => {
                chrome.tabs.remove(data[0].id, () => {
                    console.log('')
                })
                chrome.tabs.create({ url: data[0].url });

            })
        }
    }
});