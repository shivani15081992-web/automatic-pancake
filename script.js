let registeredNames = [];
let nameData = {};
const validUser = "admin";
const validPass = "12345";

// লগইন করার জন্য নতুন ফাংশন
function login() {
    const username = document.getElementById('usernameInput').value;
    const password = document.getElementById('passwordInput').value;
    
    if (username === validUser && password === validPass) {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        // লগইন সফল হলে, 0-9 পর্যন্ত ইনপুট বক্স তৈরি করুন
        createNumberInputs();
        alert('সফলভাবে লগইন হয়েছে!');
    } else {
        alert('ভুল ইউজারনেম বা পাসওয়ার্ড!');
    }
}

// 0-9 পর্যন্ত ইনপুট বক্স তৈরির ফাংশন
function createNumberInputs() {
    const numberInputsDiv = document.getElementById('numberInputs');
    numberInputsDiv.innerHTML = ''; // আগের কোনো ইনপুট থাকলে তা মুছে ফেলুন
    for (let i = 0; i <= 9; i++) {
        const inputGroup = document.createElement('div');
        inputGroup.className = 'number-input-group';
        inputGroup.innerHTML = `
            <label>${i}:</label>
            <input type="number" id="input-${i}" value="0" min="0" onchange="updateTotal()">
        `;
        numberInputsDiv.appendChild(inputGroup);
    }
}

// নাম যোগ করার ফাংশন
function addName() {
    const newNameInput = document.getElementById('newNameInput');
    const newName = newNameInput.value.trim();

    if (newName && !registeredNames.includes(newName)) {
        registeredNames.push(newName);
        nameData[newName] = Array(10).fill(0); // 10টি সংখ্যার জন্য অ্যারে তৈরি
        updateNameSelect();
        newNameInput.value = '';
        alert(`${newName} সফলভাবে রেজিস্টার হয়েছে!`);
    } else {
        alert('দয়া করে একটি বৈধ নাম লিখুন।');
    }
}

// ড্রপডাউন মেনু আপডেট করার ফাংশন
function updateNameSelect() {
    const nameSelect = document.getElementById('nameSelect');
    nameSelect.innerHTML = '<option value="">একটি নাম নির্বাচন করুন</option>';
    registeredNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        nameSelect.appendChild(option);
    });
}

// ডেটা এন্ট্রি বক্স দেখানোর ফাংশন
function showEntryBoxes() {
    const selectedName = document.getElementById('nameSelect').value;
    const entryBoxes = document.getElementById('entryBoxes');
    
    if (selectedName) {
        entryBoxes.style.display = 'block';
        loadDataForName(selectedName);
    } else {
        entryBoxes.style.display = 'none';
    }
}

// নির্বাচিত নামের জন্য ডেটা লোড করার ফাংশন
function loadDataForName(name) {
    let totalAmount = 0;
    for (let i = 0; i <= 9; i++) {
        const amount = nameData[name][i] || 0;
        document.getElementById(`input-${i}`).value = amount;
        totalAmount += amount;
    }
    document.getElementById('totalAmountDisplay').textContent = totalAmount;
}

// মোট টাকার পরিমাণ আপডেট করার ফাংশন
function updateTotal() {
    let currentTotal = 0;
    for (let i = 0; i <= 9; i++) {
        const amount = parseInt(document.getElementById(`input-${i}`).value) || 0;
        currentTotal += amount;
    }
    document.getElementById('totalAmountDisplay').textContent = currentTotal;
}

// ডেটা সেভ করার ফাংশন
function saveData() {
    const selectedName = document.getElementById('nameSelect').value;
    if (!selectedName) {
        alert('দয়া করে একটি নাম নির্বাচন করুন।');
        return;
    }

    let currentTotal = 0;
    for (let i = 0; i <= 9; i++) {
        const amount = parseInt(document.getElementById(`input-${i}`).value) || 0;
        nameData[selectedName][i] = amount;
        currentTotal += amount;
    }
    document.getElementById('totalAmountDisplay').textContent = currentTotal;
    alert(`ডেটা সেভ করা হয়েছে! মোট টাকা: ${currentTotal}`);
}
