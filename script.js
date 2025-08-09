// আপনার Google Client ID এখানে দিন
const CLIENT_ID = "1039650057318-27mqpolij5t5nv655hp2im0n3cbkn8b2.apps.googleusercontent.com";

let token = null;

// Google OAuth Login
function handleCredentialResponse(response) {
    console.log("ID Token: " + response.credential);
    document.getElementById("login-section").classList.add("hidden");
    document.getElementById("chat-section").classList.remove("hidden");
    token = response.credential;
}

// Google Sign-In ইনি‌শিয়ালাইজ
window.onload = function () {
    google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredentialResponse
    });
    google.accounts.id.renderButton(
        document.getElementById("login-btn"),
        { theme: "outline", size: "large" }
    );
};

// চ্যাট বক্সে মেসেজ যোগ করা
function addMessage(text, sender) {
    const chatBox = document.getElementById("chat-box");
    const message = document.createElement("div");
    message.classList.add("message", sender);
    message.innerText = text;
    chatBox.appendChild(message);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// AI রেসপন্স (ডেমো জন্য)
async function getAIResponse(userText) {
    // এখানে আসল AI API কল করবেন (Gemini বা অন্য)
    let correction = userText; // এখানে ভুল ঠিক করা হবে
    return `আপনি বলেছিলেন: "${userText}"\nসঠিকভাবে হবে: "${correction}"`;
}

// Send বাটন ক্লিক
document.getElementById("send-btn").addEventListener("click", async () => {
    const userInput = document.getElementById("user-input").value.trim();
    if (!userInput) return;
    addMessage(userInput, "user");
    document.getElementById("user-input").value = "";

    const aiResponse = await getAIResponse(userInput);
    addMessage(aiResponse, "bot");
});

// Hold-to-Talk (Speech Recognition)
let recognition;
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.lang = "bn-BD"; // বাংলা
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = async function (event) {
        const transcript = event.results[0][0].transcript;
        addMessage(transcript, "user");
        const aiResponse = await getAIResponse(transcript);
        addMessage(aiResponse, "bot");
    };
} else {
    alert("Speech Recognition আপনার ব্রাউজারে সাপোর্ট করে না।");
}

// Mic বাটন প্রেস ও রিলিজ
const micBtn = document.getElementById("mic-btn");
micBtn.addEventListener("mousedown", () => {
    recognition.start();
});
micBtn.addEventListener("mouseup", () => {
    recognition.stop();
});
