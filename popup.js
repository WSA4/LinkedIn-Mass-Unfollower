/**
 * LinkedIn Mass Unfollower Extension (2025)
 * Developed by: Llewellyn E. van Zyl
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

document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Popup loaded successfully!");

    const followingBtn = document.getElementById("unfollowFollowing");
    const followersBtn = document.getElementById("unfollowFollowers");

    if (!followingBtn || !followersBtn) {
        console.error("❌ Buttons not found! Ensure popup.html has correct IDs.");
        return;
    }

    followingBtn.addEventListener("click", () => {
        redirectToLinkedIn("following");
    });

    followersBtn.addEventListener("click", () => {
        redirectToLinkedIn("followers");
    });

    browser.runtime.onMessage.addListener((message) => {
        if (message.action === "completion") {
            handleCompletion(message.count, message.nextSection);
        }
    });
});

// Function to redirect to LinkedIn and inject the content script
function redirectToLinkedIn(section) {
    console.log(`🔄 Redirecting to ${section} page...`);
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        const tabId = tabs[0].id;
        const targetUrl = section === "following"
            ? "https://www.linkedin.com/mynetwork/network-manager/people-follow/following/"
            : "https://www.linkedin.com/mynetwork/network-manager/people-follow/followers/";

        browser.tabs.update(tabId, { url: targetUrl });

        browser.tabs.onUpdated.addListener(function listener(updatedTabId, changeInfo) {
            if (updatedTabId === tabId && changeInfo.status === "complete") {
                console.log(`✅ ${section} Page Loaded! Injecting Script...`);
                browser.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ["content.js"]
                }).catch((error) => console.error("❌ Error injecting script:", error));
                browser.tabs.onUpdated.removeListener(listener);
            }
        });
    }).catch((error) => console.error("❌ Error querying tabs:", error));
}


// Function to handle the completion popup
function handleCompletion(count, nextSection) {
    const nextSectionName = nextSection === "following" ? "Following" : "Followers";

    displayPopup(
        "LinkedIn Mass Unfollower",
        `Congratulations! You have unfollowed ${count} users in the previous section. Would you like to continue with the "${nextSectionName}" section?`,
        "Continue with Next Section",
        "Finish",
        () => {
            redirectToLinkedIn(nextSection);
        },
        () => {
            displayPopup(
                "LinkedIn Mass Unfollower",
                "Process completed successfully!",
                "Close",
                "",
                () => { }
            );
        }
    );
}

// Function to dynamically create and display popups (CSS glassmorphism based)
function displayPopup(title, message, confirmLabel, cancelLabel, onConfirm, onCancel) {
    const overlay = document.createElement("div");
    overlay.className = "glass-overlay";

    const popupBox = document.createElement("div");
    popupBox.className = "glass-popup-box";

    const popupHeader = document.createElement("div");
    popupHeader.className = "glass-popup-header";
    popupHeader.textContent = title;

    const popupBody = document.createElement("div");
    popupBody.className = "glass-popup-body";
    popupBody.textContent = message;

    const popupFooter = document.createElement("div");
    popupFooter.className = "glass-popup-footer";

    const confirmBtn = document.createElement("button");
    confirmBtn.textContent = confirmLabel;
    confirmBtn.className = "glass-button confirm";
    confirmBtn.onclick = () => {
        document.body.removeChild(overlay);
        onConfirm();
    };

    if (cancelLabel !== "") {
        const cancelBtn = document.createElement("button");
        cancelBtn.textContent = cancelLabel;
        cancelBtn.className = "glass-button";
        cancelBtn.onclick = () => {
            document.body.removeChild(overlay);
            onCancel();
        };
        popupFooter.appendChild(cancelBtn);
    }
    popupFooter.appendChild(confirmBtn);

    popupBox.appendChild(popupHeader);
    popupBox.appendChild(popupBody);
    popupBox.appendChild(popupFooter);
    overlay.appendChild(popupBox);
    document.body.appendChild(overlay);
}
