const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendButton = document.querySelector("button");

// আপনার API Key এখানে দিন
const apiKey = "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";

function addMessage(text, isUser = false) {
  const msg = document.createElement("div");
  msg.className = isUser ? "user-message" : "bot-message";
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, true);
  userInput.value = "";
  userInput.disabled = true; // মেসেজ পাঠানোর সময় ইনপুট ফিল্ড বন্ধ করে দেওয়া
  sendButton.disabled = true; // মেসেজ পাঠানোর সময় বাটন বন্ধ করে দেওয়া

  addMessage("🤖 উত্তর আসছে, অনুগ্রহ করে অপেক্ষা করুন...", false);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          { role: "system", content: "আপনি একজন বাংলা টু ইংরেজি ভার্চুয়াল শিক্ষিকা। আপনি সহজভাবে ইংরেজি শেখান।" },
          { role: "user", content: text }
        ]
      })
    });

    const data = await response.json();

    // লোডিং মেসেজটি সরিয়ে ফেলা
    const loadingMessage = chatBox.lastChild;
    if (loadingMessage && loadingMessage.textContent.startsWith("🤖")) {
      chatBox.removeChild(loadingMessage);
    }
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const reply = data.choices[0].message.content;
      addMessage(reply, false);
    } else {
      addMessage("⚠️ দুঃখিত, কিছু ভুল হয়েছে। আবার চেষ্টা করুন।", false);
      console.error(data);
    }

  } catch (err) {
    // লোডিং মেসেজটি সরিয়ে ফেলা
    const loadingMessage = chatBox.lastChild;
    if (loadingMessage && loadingMessage.textContent.startsWith("🤖")) {
      chatBox.removeChild(loadingMessage);
    }
    console.error(err);
    addMessage("❌ নেটওয়ার্ক বা API সমস্যা হয়েছে।", false);
  } finally {
    userInput.disabled = false; // প্রক্রিয়া শেষ হলে ইনপুট ফিল্ড চালু করা
    sendButton.disabled = false; // প্রক্রিয়া শেষ হলে বাটন চালু করা
    userInput.focus(); // ইনপুট ফিল্ডে ফোকাস ফিরিয়ে আনা
  }
}

// "পাঠান" বাটনে ক্লিক করলে বা এন্টার চাপলে মেসেজ পাঠানোর ফাংশন কল হবে
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    sendMessage();
  }
});

// ওয়েবসাইট লোড হওয়ার পর প্রথম মেসেজটি দেখানো
addMessage("👋 শুভ সকাল! আমি আপনার ভার্চুয়াল শিক্ষিকা। ইংরেজি অনুশীলন শুরু করুন।", false);
