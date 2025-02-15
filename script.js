document.addEventListener("DOMContentLoaded", function() {
    let countrySelect = document.getElementById("country");
    let phoneCode = document.getElementById("country-code");
    let quantitySelect = document.getElementById("quantity");
    let priceDisplay = document.getElementById("priceDisplay");

    // 🔹 **أسعار المنتج لكل دولة (بالعملة المحلية)**
    const prices = {
        "sa": 37,   // السعودية (ريال سعودي)
        "qa": 35,   // قطر (ريال قطري)
        "ae": 36,   // الإمارات (درهم إماراتي)
        "kw": 3,    // الكويت (دينار كويتي)
        "om": 3.7,  // عمان (ريال عماني)
        "bh": 3.8,  // البحرين (دينار بحريني)
        "eg": 300,  // مصر (جنيه مصري)
        "jo": 7,    // الأردن (دينار أردني)
        "iq": 14500,// العراق (دينار عراقي)
        "lb": 900000 // لبنان (ليرة لبنانية)
    };

    // 🔹 **رموز العملات لكل دولة**
    const currencies = {
        "sa": "ريال",
        "qa": "ريال",
        "ae": "درهم",
        "kw": "دينار",
        "om": "ريال",
        "bh": "دينار",
        "eg": "جنيه",
        "jo": "دينار",
        "iq": "دينار",
        "lb": "ليرة"
    };

    // ✅ **تحديث مفتاح الدولة عند تغيير الدولة**
    countrySelect.addEventListener("change", function() {
        let selectedOption = countrySelect.options[countrySelect.selectedIndex];
        let countryCode = selectedOption.getAttribute("data-code");
        phoneCode.textContent = countryCode;
        updatePrice();
    });

    // ✅ **تحديث السعر عند تغيير الدولة أو الكمية**
    function updatePrice() {
        let country = countrySelect.value;
        let quantity = parseInt(quantitySelect.value);
        let pricePerPiece = prices[country] || 0;
        let currency = currencies[country] || "";
        let totalPrice = pricePerPiece * quantity;

        // 🔹 عرض السعر المحدث
        priceDisplay.textContent = `💰 السعر: ${totalPrice} ${currency}`;
    }

    // ✅ تحديث السعر عند تغيير الدولة أو الكمية
    quantitySelect.addEventListener("change", updatePrice);
    updatePrice(); // تحديث السعر عند تحميل الصفحة

    // ✅ **إرسال الطلب عند النقر على الزر**
    document.getElementById("orderForm").addEventListener("submit", function(event) {
        event.preventDefault();

        let name = document.getElementById("name").value;
        let countryName = countrySelect.options[countrySelect.selectedIndex].text;
        let phone = document.getElementById("phone").value;
        let city = document.getElementById("city").value;
        let address = document.getElementById("address").value;
        let postalCode = document.getElementById("postalCode").value;
        let quantity = quantitySelect.value;
        let totalPrice = priceDisplay.textContent;
        let orderNumber = Math.floor(100000 + Math.random() * 900000); // توليد رقم طلب عشوائي

        // 📢 **تنسيق الرسالة المرسلة إلى تيليجرام**
        let message = `📢 *طلب جديد!* 🚀\n\n` +
                      `🔢 *رقم الطلب:* ${orderNumber}\n` +
                      `👤 *الاسم:* ${name}\n` +
                      `🌍 *الدولة:* ${countryName}\n` +
                      `🏙️ *المدينة:* ${city}\n` +
                      `📍 *العنوان:* ${address}\n` +
                      `📬 *الرمز البريدي:* ${postalCode}\n` +
                      `📞 *رقم الجوال:* ${phone}\n` +
                      `🛒 *الكمية المطلوبة:* ${quantity} قطع\n` +
                      `${totalPrice}\n` +
                      `🚚 *مدة الشحن:* من 1 إلى 7 أيام\n\n` +
                      `✅ *تم إرسال الطلب بنجاح!*`;

        let telegramBotToken = "6961886563:AAHZwl-UaAWaGgXwzyp1vazRu1Hf37FKX2A"; 
        let telegramChatId = "-1002290156309"; 

        let telegramUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;

        fetch(telegramUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: telegramChatId,
                text: message,
                parse_mode: "Markdown"
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                showSuccessMessage(orderNumber);
            } else {
                alert("⚠️ حدث خطأ أثناء إرسال الطلب إلى تيليجرام.");
            }
        })
        .catch(error => {
            console.error("❌ خطأ أثناء إرسال الطلب إلى تيليجرام:", error);
            alert("❌ تعذر إرسال الطلب. تحقق من الاتصال بالإنترنت.");
        });
    });

    // ✅ **عرض رسالة النجاح وتغيير المحتوى لرقم الطلب**
    function showSuccessMessage(orderNumber) {
        let button = document.querySelector(".btn-glow");
        button.innerHTML = "✅ تم إرسال الطلب بنجاح";
        button.style.background = "linear-gradient(to right, #16a085, #27ae60)";
        button.style.transition = "background 0.5s ease-in-out";

        // ✅ **إخفاء النموذج بعد الإرسال وعرض رقم الطلب**
        document.getElementById("orderForm").classList.add("hidden");
        document.getElementById("orderNumber").textContent = orderNumber;
        document.getElementById("orderNumberContainer").classList.remove("hidden");

        // ✅ **إعادة تعيين النموذج بعد 5 ثوانٍ**
        setTimeout(() => {
            button.innerHTML = "🚀 اطلب الآن والدفع عند الاستلام";
            button.style.background = "linear-gradient(to right, #f7971e, #ff4500)";
            document.getElementById("orderForm").reset();
            document.getElementById("orderForm").classList.remove("hidden");
            document.getElementById("orderNumberContainer").classList.add("hidden");
            updatePrice(); // إعادة حساب السعر بعد إعادة التعيين
        }, 5000);
    }
});
