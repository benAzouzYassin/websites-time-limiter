themeSwitcher.addEventListener("click", toggleTheme)

function toggleTheme() {
    console.log("toggeling theme")
    chrome.storage.local.get(["theme"])
        .then(data => {
            if (data.theme == "light") {
                chrome.storage.local.set({ "theme": "dark" }).then(() => body.className = "dark")


            } else {
                chrome.storage.local.set({ "theme": "light" }).then(() => body.className = "light")

            }
        })
}

