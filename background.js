//update date evrey time opens the browser
chrome.windows.onCreated.addListener(updateDate)

//check if new tab website is banned 
chrome.tabs.onCreated.addListener(function (tab) {
    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, updatedTab) {
        if (changeInfo.status == "loading" && changeInfo.url) {
            console.log("cheking this ", tabId)
            checkCurrent(changeInfo.url, tabId)
        }
    });
});
//checks when a tab is updated
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, updatedTab) {
    if (changeInfo.status == "loading" && changeInfo.url) {
        console.log("cheking this ", tabId)
        checkCurrent(changeInfo.url, tabId)
    }
});
//checking current website is banned and starting the time if it is
async function checkCurrent(currentUrl, id) {
    const data = await chrome.storage.local.get(["bannedSites"]) ?? []
    const bannedUrls = await data.bannedSites
    if (isBanned(currentUrl, bannedUrls)) {
        //starting timer or closing the tab
        chrome.storage.local.get(["timeLeft"]).then(data => {
            if (data.timeLeft && data.timeLeft > 0) {
                //start timer(data.timeLeft)
                startTimer(data.timeLeft, id, bannedUrls)
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

//updating active tab whenever a new website get banned
chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (let key in changes) {
        if (key === "bannedSites") {
            try {
                chrome.tabs.query({ active: true, highlighted: true }).then(data => {
                    chrome.tabs.remove(data[0].id, () => {
                        console.log('removed')
                    })
                    chrome.tabs.create({ url: data[0].url });
                    console.log("back")

                })
            } catch (error) {
                console.log('error idk why')
            }

        }
    }
});

//going to implement time reset check evrey 1 hour
setInterval(updateDate, 7200000);
//functions

function startTimer(timeLeft, id, bannedUrls) {
    const intervaleId = setInterval(() => {
        chrome.tabs.query({ active: true, highlighted: true }).then(tabs => {
            if (tabs[0].id == id && isBanned(tabs[0].url, bannedUrls)) {
                timeLeft--
                chrome.storage.local.set({ "timeLeft": timeLeft })
            }
        })
        if (timeLeft <= 1) {
            try {
                chrome.tabs.remove(id, () => {
                    console.log('')
                })
                clearInterval(intervaleId)
            } catch (err) { clearInterval(intervaleId) }

        }
    }, 1000)
}

function updateDate() {
    const date = new Date()
    const today = date.getDay().toString() + date.getFullYear().toString()
    chrome.storage.local.get(["lastDate"])
        .then(data => {
            if (data.lastDate != today) {
                chrome.storage.local.set({ "lastDate": today }).then(data => console.log("updated lastDate"))
                chrome.storage.local.get(["timeLimit"]).then(data => {
                    const timeLimit = data.timeLimit ?? 60
                    chrome.storage.local.set({ "timeLeft": timeLimit }).then(data => console.log("reseted time left "))
                })
            }
        })
}

function extractDomainName(url) {
    let domain = url.replace(/(^\w+:|^)\/\/(www\.)?/, '');

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
