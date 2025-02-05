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

    // Check if buttons exist
    if (!document.getElementById("unfollowFollowing") || !document.getElementById("unfollowFollowers")) {
        console.error("❌ Buttons not found! Ensure popup.html has correct IDs.");
        return;
    }

    // Attach click events to buttons
    document.getElementById("unfollowFollowing").addEventListener("click", () => {
        redirectToLinkedIn("following");
    });

    document.getElementById("unfollowFollowers").addEventListener("click", () => {
        redirectToLinkedIn("followers");
    });

    // Listen for messages from content.js
    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === "completion") {
            handleCompletion(message.count, message.nextSection);
        }
    });
});

// Function to redirect to LinkedIn and inject the content script
function redirectToLinkedIn(section) {
  console.log(`🔄 Redirecting to ${section} page...`);
  chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    const tabId = tabs[0].id;
    const targetUrl = section === "following"
      ? "https://www.linkedin.com/mynetwork/network-manager/people-follow/following/"
      : "https://www.linkedin.com/mynetwork/network-manager/people-follow/followers/";

    chrome.tabs.update(tabId, { url: targetUrl });

    chrome.tabs.onUpdated.addListener(function listener(updatedTabId, changeInfo) {
      if (updatedTabId === tabId && changeInfo.status === "complete") {
        console.log(`✅ ${section} Page Loaded! Injecting Script...`);
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ["content.js"]
        }).catch((error) => console.error("❌ Error injecting script:", error));
        chrome.tabs.onUpdated.removeListener(listener);
      }
    });
  }).catch((error) => console.error("❌ Error querying tabs:", error));
}


// Function to handle the completion popup
function handleCompletion(count, nextSection) {
    const nextSectionName = nextSection === "following" ? "Following" : "Followers";

    displayPopup(
        "LinkedIn Mass Unfollower",
        `Congratulations! You have unfollowed ${count} users in the "${nextSectionName}" section.<br><br>
        Would you like to continue with the "${nextSectionName}" section?`,
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
                () => {}
            );
        }
    );
}

// Function to dynamically create and display popups
function displayPopup(title, message, confirmLabel, cancelLabel, onConfirm, onCancel) {
    const overlay = document.createElement("div");
    overlay.style = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.7); z-index: 9999;
        display: flex; justify-content: center; align-items: center;`;

    const popupBox = document.createElement("div");
    popupBox.style = `
        width: 400px; height: auto; background: white; border-radius: 10px;
        overflow: hidden; display: flex; flex-direction: column;
        box-shadow: 0px 5px 15px rgba(0,0,0,0.3);`;

    const popupHeader = document.createElement("div");
    popupHeader.style = `
        background: #008da1; color: white; padding: 15px;
        font-size: 18px; font-weight: bold; text-align: center;`;
    popupHeader.innerText = title;

    const popupBody = document.createElement("div");
    popupBody.style = `
        flex-grow: 1; background: #e0e0e0; color: black;
        padding: 20px; font-size: 16px; text-align: center;`;
    popupBody.innerHTML = message;

    const popupFooter = document.createElement("div");
    popupFooter.style = "display: flex; justify-content: space-around; padding: 15px; background: white;";

    const confirmBtn = document.createElement("button");
    confirmBtn.innerText = confirmLabel;
    confirmBtn.style = `
        background: #008da1; color: white; padding: 10px 20px;
        border: 2px solid white; border-radius: 5px; cursor: pointer;`;
    confirmBtn.onmouseover = () => (confirmBtn.style.background = "#b1dd0c");
    confirmBtn.onmouseleave = () => (confirmBtn.style.background = "#008da1");
    confirmBtn.onclick = () => {
        document.body.removeChild(overlay);
        onConfirm();
    };

    const cancelBtn = document.createElement("button");
    cancelBtn.innerText = cancelLabel;
    cancelBtn.style = `
        background: #008da1; color: white; padding: 10px 20px;
        border: 2px solid white; border-radius: 5px; cursor: pointer;`;
    cancelBtn.onmouseover = () => (cancelBtn.style.background = "#b1dd0c");
    cancelBtn.onmouseleave = () => (cancelBtn.style.background = "#008da1");
    cancelBtn.onclick = () => {
        document.body.removeChild(overlay);
        onCancel();
    };

    if (cancelLabel !== "") {
        popupFooter.appendChild(cancelBtn);
    }
    popupFooter.appendChild(confirmBtn);

    popupBox.appendChild(popupHeader);
    popupBox.appendChild(popupBody);
    popupBox.appendChild(popupFooter);
    overlay.appendChild(popupBox);
    document.body.appendChild(overlay);
}
