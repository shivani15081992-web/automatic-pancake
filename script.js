<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>সহজ ইংরেজি শিখুন</title>
  <style>
    body {
      font-family: sans-serif;
      background-color: #f8f8f8;
      margin: 0;
      padding: 0;
    }
    header {
      background-color: #007bff;
      color: white;
      padding: 1rem;
      text-align: center;
    }
    .container {
      padding: 1rem;
    }
    .chat-box {
      background-color: white;
      padding: 1rem;
      border-radius: 10px;
      height: 60vh;
      overflow-y: auto;
      margin-bottom: 1rem;
    }
    .user-message, .bot-message {
      margin: 0.5rem 0;
      padding: 0.7rem;
      border-radius: 10px;
      max-width: 80%;
    }
    .user-message {
      background-color: #d1f0d1;
      text-align: right;
      margin-left: auto;
    }
    .bot-message {
      background-color: #e0e0ff;
      text-align: left;
    }
    .input-row {
      display: flex;
      gap: 0.5rem;
    }
    input {
      flex: 1;
      padding: 0.7rem;
      border-radius: 5px;
      border: 1px solid #ccc;
      font-size: 1rem;
    }
    button {
      padding: 0.7rem 1rem;
      border: none;
      background-color: #007bff;
      color: white;
      border-radius: 5px;
      font-size: 1rem;
    }
  </style>
</head>
<body>

<header>
  <h2>সহজ ইংরেজি শিখুন</h2>
  <p>আপনার স্পোকেন ইংলিশ শেখার যাত্রা শুরু করুন।</p>
</header>

<div class="container">
  <div class="chat-box" id="chat-box"></div>

  <div class="input-row">
    <input type="text" id="user-input" placeholder="এখানে টাইপ করে বলুন...">
    <button onclick="sendMessage()">পাঠান</button>
  </div>
</div>

<script>
  const chatBox = document.getElementById("chat-box");
  const userInput = document.getElementById("user-input");

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

    addMessage("🤖 উত্তর আসছে, অনুগ্রহ করে অপেক্ষা করুন...", false);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer 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",
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

      if (data.choices && data.choices[0] && data.choices[0].message) {
        const reply = data.choices[0].message.content;
        addMessage(reply, false);
      } else {
        addMessage("⚠️ দুঃখিত, কিছু ভুল হয়েছে। আবার চেষ্টা করুন।", false);
        console.error(data);
      }

    } catch (err) {
      console.error(err);
      addMessage("❌ নেটওয়ার্ক বা API সমস্যা হয়েছে।", false);
    }
  }

  addMessage("👋 শুভ সকাল! আমি আপনার ভার্চুয়াল শিক্ষিকা। ইংরেজি অনুশীলন শুরু করুন।", false);
</script>

</body>
</html>
