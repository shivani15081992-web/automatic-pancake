// আপনার Google Gemini API Key এখানে পেস্ট করুন
const GEMINI_API_KEY = "AIzaSyC3bmWu50URTnT0jiek3WRV4rgJf8fvhis";

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

// কোর্সের বিষয়বস্তু
const lessons = [
    {
        title: "পাঠ ১: সাধারণ অভিবাদন (Greetings)",
        content: `
            <p>ইংরেজিতে কথা বলা শুরু করার জন্য কিছু সাধারণ অভিবাদন জানা খুব জরুরি।</p>
            <ul>
                <li>Hello! (হ্যালো!) - সাধারণ অভিবাদন।</li>
                <li>Hi! (হাই!) - অনানুষ্ঠানিক অভিবাদন।</li>
                <li>Good morning! (গুড মর্নিং!) - শুভ সকাল।</li>
                <li>Good afternoon! (গুড আফটারনুন!) - শুভ দুপুর।</li>
                <li>Good evening! (গুড ইভিনিং!) - শুভ সন্ধ্যা।</li>
            </ul>
            <p>অনুশীলন: একটি অভিবাদন বেছে নিয়ে বলুন এবং আপনার ভার্চুয়াল শিক্ষককে পাঠান।</p>
        `
    },
    {
        title: "পাঠ ২: নিজের পরিচয় দেওয়া (Introducing Yourself)",
        content: `
            <p>এই পাঠে আমরা শিখব কীভাবে ইংরেজিতে নিজের পরিচয় দিতে হয়।</p>
            <ul>
                <li>My name is [আপনার নাম]. (মাই নেম ইজ [আপনার নাম]) - আমার নাম...</li>
                <li>I am [আপনার নাম]. (আই অ্যাম [আপনার নাম]) - আমি...</li>
                <li>I am from [আপনার দেশ/শহর]. (আই অ্যাম ফ্রম [আপনার দেশ/শহর]) - আমি... থেকে এসেছি।</li>
            </ul>
            <p>অনুশীলন: আপনার নাম ও কোথা থেকে এসেছেন তা ইংরেজিতে লিখে পাঠান।</p>
        `
    },
    {
        title: "পাঠ ৩: প্রশ্ন করা (Asking Questions)",
        content: `
            <p>ইংরেজিতে সাধারণ প্রশ্ন করা শিখুন।</p>
            <ul>
                <li>How are you? (হাউ আর ইউ?) - আপনি কেমন আছেন?</li>
                <li>What is your name? (হোয়াট ইজ ইউর নেম?) - তোমার নাম কী?</li>
                <li>Where are you from? (হোয়্যার আর ইউ ফ্রম?) - তুমি কোথা থেকে এসেছো?</li>
            </ul>
            <p>অনুশীলন: আপনার ভার্চুয়াল শিক্ষককে একটি সাধারণ প্রশ্ন করুন।</p>
        `
    }
    // আপনি এখানে আরও পাঠ যোগ করতে পারেন
];

let currentLessonIndex = 0;

// HTML উপাদানগুলো নির্বাচন করা
const lessonTitle = document.getElementById("lesson-title");
const lessonContent = document.getElementById("lesson-content");
const nextLessonBtn = document.getElementById("next-lesson-btn");
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// পাঠ লোড করার ফাংশন
function loadLesson(index) {
    const lesson = lessons[index];
    lessonTitle.textContent = lesson.title;
    // এখানে lessonContent এর পরিবর্তে course-section এর div-এর মধ্যে content যোগ করতে হবে
    document.querySelector('.lesson-content').innerHTML = lesson.content;
}

// পরবর্তী পাঠে যাওয়ার ফাংশন
nextLessonBtn.addEventListener("click", () => {
    currentLessonIndex++;
    if (currentLessonIndex < lessons.length) {
        loadLesson(currentLessonIndex);
    } else {
        alert("কোর্স সম্পন্ন! আরও পাঠ খুব শীঘ্রই আসবে।");
        nextLessonBtn.disabled = true;
    }
});

// চ্যাটবটে মেসেজ যোগ করার ফাংশন
function addMessage(text, isUser = false) {
    const message = document.createElement("p");
    message.textContent = text;
    message.classList.add(isUser ? "user-message" : "bot-message");
    chatBox.appendChild(message);
    chatBox.scrollTop = chatBox.scrollHeight; // স্ক্রল নিচে নামানো
}

// ব্যবহারকারীর ইনপুট পাঠানোর ফাংশন
sendBtn.addEventListener("click", async () => {
    const userMessage = userInput.value;
    if (userMessage.trim() === "") return;

    addMessage(userMessage, true);
    userInput.value = "";
    
    // Gemini API-কে প্রশ্ন পাঠানো
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{text: `আপনি একজন বাংলাভাষী স্পোকেন ইংলিশ শিক্ষক। একজন শিক্ষার্থী আপনাকে বলছে: ${userMessage}। তার উত্তরটি খুব সহজে বাংলায় বুঝিয়ে দিন এবং যদি কোনো ভুল থাকে তবে তা সংশোধন করে দিন।`}]
                }]
            })
        });

        const data = await response.json();
        const botResponse = data.candidates[0].content.parts[0].text;
        addMessage(botResponse, false);

    } catch (error) {
        console.error("Gemini API Error:", error);
        addMessage("দুঃখিত, কোনো ভুল হয়েছে। আবার চেষ্টা করুন।", false);
    }
});

// প্রথম পাঠ লোড করা
loadLesson(currentLessonIndex);
