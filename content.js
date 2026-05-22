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


let unfollowedCount = 0;
let currentSection = null;

function initiateUnfollow(section) {
    currentSection = section;

    function processUnfollow() {
        const followButtons = document.querySelectorAll("button[aria-label*='Click to stop following']");
        if (followButtons.length === 0) {
            scrollDownAndRetry();
            return;
        }

        followButtons[0].click();
        setTimeout(() => {
            const modal = document.querySelector(".artdeco-modal");
            if (modal) {
                const unfollowBtn = modal.querySelector(".artdeco-modal__actionbar .artdeco-button--primary");
                if (unfollowBtn) {
                    unfollowBtn.click();
                    unfollowedCount++;
                }
            }
            const randomDelay2 = Math.floor(Math.random() * (3500 - 2000 + 1) + 2000);
            setTimeout(processUnfollow, randomDelay2);
        }, Math.floor(Math.random() * (2000 - 1000 + 1) + 1000));
    }

    let scrollRetries = 0;
    const MAX_RETRIES = 5;

    function scrollDownAndRetry() {
        let initialHeight = document.body.scrollHeight;

        // The "Scroll Jiggle" to trigger IntersectionObservers on modern SPAs
        window.scrollTo(0, document.body.scrollHeight);
        setTimeout(() => {
            window.scrollBy(0, -500); // Scroll up slightly
            setTimeout(() => {
                window.scrollTo(0, document.body.scrollHeight); // Scroll back down
            }, 500);
        }, 500);

        setTimeout(() => {
            const newFollowButtons = document.querySelectorAll("button[aria-label*='Click to stop following']");
            if (newFollowButtons.length > 0) {
                // Found new targets! Reset retries and continue.
                scrollRetries = 0;
                initiateUnfollow(currentSection);
            } else {
                if (document.body.scrollHeight > initialHeight) {
                    // Height increased, content might still be rendering. Wait and retry.
                    scrollRetries = 0;
                    setTimeout(scrollDownAndRetry, 5000);
                } else {
                    // Reached the apparent "bottom". Bump retry counter.
                    scrollRetries++;
                    if (scrollRetries < MAX_RETRIES) {
                        console.log(`[Mass Unfollower] End of page reached. Waiting for lazy load... (Attempt ${scrollRetries}/${MAX_RETRIES})`);
                        setTimeout(scrollDownAndRetry, 3500);
                    } else {
                        console.log("[Mass Unfollower] Giving up. No more users detected.");
                        displayCompletionPopup();
                    }
                }
            }
        }, 5000);
    }

    function displayCompletionPopup() {
        const nextSection = currentSection === "following" ? "followers" : "following";

        // 🔄 Update to Manifest V3 background messaging
        browser.runtime.sendMessage({
            action: "completion",
            count: unfollowedCount,
            nextSection: nextSection
        }).catch((error) => console.error("❌ Error sending message:", error));
    }

    processUnfollow();
}

// ✅ Ensure the script starts **only after the page is fully loaded**
setTimeout(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get("section") || "following"; // Default to "following"
    initiateUnfollow(section);
}, 5000); // Wait for dynamic content to load
