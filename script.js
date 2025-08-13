let registeredNames = [];
let nameData = {};

document.addEventListener('DOMContentLoaded', () => {
    // 0 থেকে 9 পর্যন্ত ইনপুট বক্স তৈরি করা
    const numberInputsDiv = document.getElementById('numberInputs');
    for (let i = 0; i <= 9; i++) {
        const inputGroup = document.createElement('div');
        inputGroup.className = 'number-input-group';
        inputGroup.innerHTML = `
            <label>${i}:</label>
            <input type="number" id="input-${i}" value="0" min="0">
        `;
        numberInputsDiv.appendChild(inputGroup);
    }
});

function addName() {
    const newNameInput = document.getElementById('newNameInput');
    const newName = newNameInput.value.trim();

    if (newName && !registeredNames.includes(newName)) {
        registeredNames.push(newName);
        nameData[newName] = {}; // নতুন নামের জন্য ডেটা অবজেক্ট তৈরি
        updateNameSelect();
        newNameInput.value = '';
        alert(`${newName} সফলভাবে রেজিস্টার হয়েছে!`);
    } else {
        alert('দয়া করে একটি বৈধ নাম লিখুন।');
    }
}

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

function loadDataForName(name) {
    let totalAmount = 0;
    for (let i = 0; i <= 9; i++) {
        const inputField = document.getElementById(`input-${i}`);
        // এখানে ডেটা লোড করার লজিক লিখতে হবে (যদি ডেটাবেজ থাকত)
        // আপাতত, প্রতিটি ইনপুট বক্স ০ দিয়ে শুরু হবে
        inputField.value = 0;
    }
    document.getElementById('totalAmountDisplay').textContent = totalAmount;
}

function saveData() {
    const selectedName = document.getElementById('nameSelect').value;
    if (!selectedName) {
        alert('দয়া করে একটি নাম নির্বাচন করুন।');
        return;
    }

    let currentTotal = 0;
    for (let i = 0; i <= 9; i++) {
        const amount = parseInt(document.getElementById(`input-${i}`).value) || 0;
        // এখানে ডেটা সেভ করার লজিক লিখতে হবে
        // বর্তমানে, এটি শুধুমাত্র টোটাল হিসাব করবে।
        currentTotal += amount;
    }

    document.getElementById('totalAmountDisplay').textContent = currentTotal;
    alert(`ডেটা সেভ করা হয়েছে! মোট টাকা: ${currentTotal}`);
    // এখানে রিপোর্ট আপডেট করার লজিক লিখতে হবে।
}
