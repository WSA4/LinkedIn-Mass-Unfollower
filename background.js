// Edge/Chromium compatibility polyfill (allows using `browser.*` namespace on Chrome/Edge)
if (typeof browser === "undefined") { var browser = chrome; }
    
    /**
 * LinkedIn Mass Unfollower Extension (2025)
 * Developed by: Prof. Llewellyn E. van Zyl (Ph.D)
 * Website: www.psynalytics.com
 * 
 * TERMS & CONDITIONS:
 * By using the LinkedIn Mass Unfollower Extension ("the Extension"), developed by Llewellyn E. van Zyl ('the Developer') you acknowledge that you have read, understood, 
 * and agreed to be bound by these Terms & Conditions.
 * 
 * 1. ACCEPTANCE OF TERMS
 *    - By using this Extension, you agree to these Terms & Conditions in full.
 * 
 * 2. DISCLAIMER OF LIABILITY
 *    - The Extension is provided "as is" without any warranty of any kind.
 *    - The developer makes no guarantees about the reliability, accuracy, or safety of this Extension.
 *    - The developer is NOT responsible for any account bans, suspensions, or restrictions imposed by LinkedIn.
 *    - The developer is NOT liable for any direct, indirect, incidental, or consequential damages resulting from 
 *      the use of this Extension.
 * 
 * 3. USER RESPONSIBILITY
 *    - You acknowledge that you use this Extension at your own risk.
 *    - You are solely responsible for ensuring compliance with LinkedIn's Terms of Service.
 *    - The developer does not encourage or support misuse of this tool.
 * 
 * 4. NO LICENSE, BUT ATTRIBUTION REQUIRED
 *    - This script is free to use and modify.
 *    - Attribution to the original developer is required if used or distributed.
 * 
 * 5. CHANGES TO THESE TERMS
 *    - The developer reserves the right to update these Terms & Conditions at any time without prior notice.
 * 
 * 6. CONTACT INFORMATION
 *    - If you have any questions, contact visit www.psynalytics.com
 * 
 * By using this Extension, you confirm that you have read and agreed to these Terms & Conditions.
 */


browser.runtime.onInstalled.addListener(() => {
    console.log("✅ LinkedIn Mass Unfollower Extension Installed!");
});

// Handle browser action clicks
browser.action.onClicked.addListener((tab) => {
    const options = {
        type: "basic",
        title: "LinkedIn Mass Unfollower",
        message: "Let's head over to LinkedIn and start the process.",
        iconUrl: browser.runtime.getURL("icon.png"),
        buttons: [{ title: "Confirm" }]
    };

    browser.notifications.create("", options).then((notificationId) => {
        browser.notifications.onButtonClicked.addListener((id, buttonIndex) => {
            if (id === notificationId && buttonIndex === 0) {
                browser.tabs.create({
                    url: "https://www.linkedin.com/mynetwork/network-manager/people-follow/followers/"
                });
            }
        });
    });
});

// Listen for messages from popup.js
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "startUnfollowing") {
        console.log(`🚀 Starting unfollow process for: ${message.section}`);
        browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
            if (!tabs.length) return;
            const tabId = tabs[0].id;

            browser.scripting.executeScript({ target: { tabId: tabId }, files: ["content.js"] })
                .catch((error) => console.error("❌ Error injecting content script:", error));
        });
    }
});
