chrome.runtime.onInstalled.addListener(() => init());  
chrome.runtime.onStartup.addListener(() => run());   
chrome.alarms.onAlarm.addListener((alarm) => run());

const init = () => {
    let msgs = {};
    fetch('../_locales/en/messages.json').then((response)  => { response.json().then((data) => {
            Object.entries(data).forEach(([key, value]) => { msgs[key] = value.message });
            chrome.storage.local.set({ 'msgs': msgs }, () => {
                run();
                let w = new Date();
                w.setMinutes(w.getMinutes() + 1);
                w.setSeconds(0);
                chrome.alarms.create('everyMinute', { periodInMinutes: 1, when: Date.parse(w) });
            });
        });
    });
}

const run = () => {
    chrome.storage.local.get(['msgs'], (result) => {
        let dateOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
        let iconPath = result.msgs.icon;
        let dt = new Date(new Date().toLocaleString("en-US", { timeZone: result.msgs.timeZone }));
        let ds = dt.toLocaleString("en-US", dateOptions);
        let ampm = "";
        let hours = dt.getHours();
        if (result.msgs.mode == "12")
        {
            if (hours > 12)
                ampm = "pm"
            else
                ampm = "am"
            hours = hours % 12 || 12;
        }
        chrome.action.setBadgeText({ 'text': hours + ':' + zeroPad(dt.getMinutes()) });
        chrome.action.setIcon({ 'path': iconPath });
        chrome.action.setTitle({ 'title': ds + ' ' + hours + ':' + zeroPad(dt.getMinutes()) + ampm + ' (' + result.msgs.mode + 'hr mode)'});
        chrome.action.setBadgeBackgroundColor({ 'color': '#2E3338' });
    });
};

const zeroPad = (n) => { return (n < 10 ? '0' + n : n) }

chrome.action.onClicked.addListener((tab) => {
    chrome.storage.local.get(['msgs'], (result) => {
        result.msgs.mode = (result.msgs.mode == "12") ? 24 : 12;
        chrome.storage.local.set({ 'msgs': result.msgs }, () => {
            chrome.action.setBadgeText({ 'text': result.msgs.mode+'hr' });
            setTimeout(run, 1000);
        });

    });
});