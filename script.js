"use strict"

async function blockCurrent() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentUrl = tabs[0].url;
    const data = await chrome.storage.local.get("bannedSites")
    let bannedSites = data.bannedSites ?? []
    if (bannedSites.indexOf(currentUrl) === -1 && !currentUrl.startsWith("chrome:")) {
        bannedSites.push(currentUrl)
        chrome.storage.local.set({ "bannedSites": bannedSites })
        chrome.tabs.reload(tabs[0].id);
    }
    chrome.runtime.reload()
}


function unbanUrl(e) {
    //updating the banned websites
    chrome.storage.local.get(["bannedSites"])
        .then((data) => {
            const toUnbanUrl = e.target.parentNode.innerText.split(" ")[0]
            const newBannedList = data.bannedSites.filter((value) => {
                if (value == toUnbanUrl) {
                    return false
                } else {
                    return true
                }
            })
            //update local storage with the new banned sites
            chrome.storage.local.set({ "bannedSites": newBannedList })
            chrome.runtime.reload()
        })
        .catch(err => console.log(err))


}

function loadBannedSites() {
    //rendering the banned websites
    chrome.storage.local.get(["bannedSites"])
        .then((data) => {
            data.bannedSites.forEach((url) => {
                blockedSites.innerHTML += `<li>${url}   <button class="unbanBtn">delete</button></li>`
            })
            //adding unban functionality to all the delete btns 
            const unbanButtons = document.getElementsByClassName("unbanBtn")
            for (let i = 0; i < unbanButtons.length; i++) {
                unbanButtons.item(i).addEventListener("click", unbanUrl)
            }
        })
        .catch(err => console.error(err))
}

function loadTimeLeft() {
    chrome.storage.local.get(["timeLeft"]).then(data => {
        timeLeft.innerHTML = data.timeLeft
    })
}

blockBtn.onclick = () => {
    blockCurrent()
}

function renderTimeLimit() {
    chrome.storage.local.get(["timeLimit"]).then(data => {
        if (data.timeLimit < 1) {
            initialTime.innerHTML = 0

        } else {
            initialTime.innerHTML = data.timeLimit

        }

    })

}

body.onload = () => {
    loadBannedSites()
    loadTimeLeft()
    renderTimeLimit()
    chrome.storage.onChanged.addListener(function (changes, namespace) {
        for (let key in changes) {
            if (key === "timeLeft") {
                let timeToClose = changes[key].newValue;
                timeLeft.innerHTML = timeToClose
            }
        }
    });

}

saveBtn.onclick = () => {
    console.log(timeLimit.value)
    initialTime.innerHTML = timeLimit.value
    chrome.storage.local.set({ "timeLimit": parseInt(timeLimit.value) })
}
