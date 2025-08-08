const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");

// আপনার API Key এখানে দিন
const apiKey = "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";

// স্পিচ সিন্থেসিস (Text-to-Speech)
const synth = window.speechSynthesis;
function getBengaliFemaleVoice() {
    const voices = synth.getVoices();
    const femaleVoice = voices.find(voice => voice.lang === 'bn-BD' && voice.name.includes('Female')) ||
                      voices.find(voice => voice.lang.startsWith('bn') && voice.name.includes('Female')) ||
                      voices.find(voice => voice.lang === 'bn-IN' && voice.name.includes('Female'));
    return femaleVoice;
}

function addMessage(text, isUser = false) {
  const msg = document.createElement("div");
  msg.className = isUser ? "user-message" : "bot-message";
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (!isUser && text) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'bn-BD';
      const femaleVoice = getBengaliFemaleVoice();
      if (femaleVoice) {
          utterance.voice = femaleVoice;
      } else {
          console.warn("No Bengali female voice found. Using default voice.");
      }
      synth.speak(utterance);
  }
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, true);
  userInput.value = "";
  userInput.disabled = true;
  sendButton.disabled = true;

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
    const loadingMessage = chatBox.lastChild;
    if (loadingMessage && loadingMessage.textContent.startsWith("🤖")) {
      chatBox.removeChild(loadingMessage);
    }
    console.error(err);
    addMessage("❌ নেটওয়ার্ক বা API সমস্যা হয়েছে।", false);
  } finally {
    userInput.disabled = false;
    sendButton.disabled = false;
    userInput.focus();
  }
}

sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    sendMessage();
  }
});

addMessage("👋 শুভ সকাল! আমি আপনার ভার্চুয়াল শিক্ষিকা। ইংরেজি অনুশীলন শুরু করুন।", false);
