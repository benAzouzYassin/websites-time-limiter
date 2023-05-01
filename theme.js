themeSwitcher.addEventListener("click", toggleTheme)

function toggleTheme() {
    chrome.storage.local.get(["theme"])
        .then(data => {
            if (data.theme == "light") {
                chrome.storage.local.set({ "theme": "dark" }).then(() => {
                    timeLimit.className = "timeLimitInput--dark timeLimitInput"
                    body.className = "dark"
                })


            } else {
                chrome.storage.local.set({ "theme": "light" }).then(() => {
                    timeLimit.className = "timeLimitInput--light timeLimitInput"
                    body.className = "light"
                })

            }
        })
}

