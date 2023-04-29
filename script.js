body.onload = () => {
    loadBannedSites()
    loadTimeLeft()
    renderTimeLimit()
    chrome.storage.onChanged.addListener(function (changes, namespace) {
        for (let key in changes) {
            if (key === "timeLeft") {
                let timeToClose = changes[key].newValue;

                updateTimeLeftUi(timeToClose)

            }
        }
    });

}

//saves time limit taken from user
saveBtn.onclick = () => {
    const timeLimitInSeconds = parseInt(timeLimit.value) * 60
    chrome.storage.local.set({ "timeLimit": timeLimitInSeconds })
    const [hours, minutes, seconds] = formatTime(timeLimitInSeconds)
    initialTime.innerText = `${hours}:${minutes}:${seconds}`
}
//banning current website
blockBtn.onclick = () => {
    blockCurrent()
}

async function blockCurrent() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentUrl = tabs[0].url;
    const data = await chrome.storage.local.get("bannedSites")
    let bannedSites = data.bannedSites ?? []
    if (bannedSites.indexOf(extractDomainName(currentUrl)) === -1 && !currentUrl.startsWith("chrome:")) {

        bannedSites.push(extractDomainName(currentUrl))
        chrome.storage.local.set({ "bannedSites": bannedSites })
        chrome.tabs.reload(tabs[0].id);
    }
    //chrome.runtime.reload()
}

//used on the unban button
function unbanUrl(e) {
    chrome.storage.local.get(["bannedSites"])
        .then((data) => {
            const toUnbanUrl = e.target.parentNode.innerText.split("\n")[0]
            console.log(toUnbanUrl)
            const newBannedList = data.bannedSites.filter((value) => {
                if (value == toUnbanUrl) {
                    return false
                } else {
                    return true
                }
            })
            chrome.storage.local.set({ "bannedSites": newBannedList })
            chrome.runtime.reload()
        })
        .catch(err => console.log(err))


}

function loadBannedSites() {
    chrome.storage.local.get(["bannedSites"])
        .then((data) => {
            data.bannedSites.forEach((url) => {
                blockedSites.innerHTML += `<li class="bannedLink">${url}<button class="unbanBtn">delete</button></li>`
            })
            const unbanButtons = document.getElementsByClassName("unbanBtn")
            for (let i = 0; i < unbanButtons.length; i++) {
                unbanButtons.item(i).addEventListener("click", unbanUrl)
            }
        })
        .catch(err => console.error(err))
}

function loadTimeLeft() {
    chrome.storage.local.get(["timeLeft"]).then(data => {
        if (data.timeLeft < 0) {
            timeLeftSeconds.innerHTML = "00"
            timeLeftMinutes.innerHTML = "00"
            timeLeftHours.innerHTML = "00"
        }
        else {
            const [hours, minutes, seconds] = formatTime(data.timeLeft)
            timeLeftHours.innerHTML = hours
            timeLeftMinutes.innerHTML = minutes
            timeLeftSeconds.innerHTML = seconds

        }
    })
}


function renderTimeLimit() {
    chrome.storage.local.get(["timeLimit"]).then(data => {
        if (data.timeLimit < 1) {
            initialTime.innerHTML = 0

        } else {
            const [hours, minutes, seconds] = formatTime(data.timeLimit)
            initialTime.innerText = `${hours}:${minutes}:${seconds}`

        }

    })

}

function extractDomainName(url) {
    // Remove any protocol and www from the URL
    let domain = url.replace(/(^\w+:|^)\/\/(www\.)?/, '');

    // Remove any path or query parameters
    domain = domain.split('/')[0];

    return domain;
}

function formatTime(seconds) {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    let remainingSeconds = seconds % 60;

    return [hours.toString().padStart(2, '0'), minutes.toString().padStart(2, '0'), remainingSeconds.toString().padStart(2, '0')];
}
function updateTimeLeftUi(time) {
    const [oldHours, oldMinutes, oldSeconds] = timeLeft.innerText.split(":")
    const [hours, minutes, seconds] = formatTime(parseInt(time))
    if (oldHours != hours) {
        timeLeftHours.innerHTML = hours

    }
    if (oldMinutes != minutes) {
        timeLeftMinutes.innerHTML = minutes
        console.log(oldMinutes.length, minutes.length)
    }
    if (oldSeconds != seconds) {
        setTimeout(() => timeLeftSeconds.className = "transition-down", 300)
        setTimeout(() => {
            timeLeftSeconds.className = "none"
            timeLeftSeconds.innerHTML = seconds
            timeLeftSeconds.className = "transition-above"
        }, 700)
    }
}