document.addEventListener("DOMContentLoaded", function () {
    // ✅ جلب عناصر الصفحة
    let countrySelect = document.getElementById("country");
    let phoneCode = document.getElementById("country-code");
    let quantitySelect = document.getElementById("quantity");
    let priceDisplay = document.getElementById("priceDisplay");
    let reviewForm = document.getElementById("reviewForm");
    let reviewsList = document.getElementById("reviewsList");
    let adminLoginButton = document.getElementById("adminLoginFooter"); // زر تسجيل الدخول
    let logoutButton = document.createElement("button"); // زر تسجيل الخروج

    logoutButton.id = "logoutAdmin";
    logoutButton.textContent = "🚪 تسجيل الخروج";
    logoutButton.classList = "btn-glow mt-4 bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded hidden";
    document.body.appendChild(logoutButton);

    const ADMIN_PASSWORD = "123456"; // ✅ كلمة مرور المالك

    // ✅ أسعار المنتج لكل دولة (بالعملة المحلية)
    const prices = {
        "sa": 37, "qa": 35, "ae": 36, "kw": 3, "om": 3.7, "bh": 3.8,
        "eg": 300, "jo": 7, "iq": 14500, "lb": 900000
    };

    // ✅ رموز العملات لكل دولة
    const currencies = {
        "sa": "ريال", "qa": "ريال", "ae": "درهم", "kw": "دينار", "om": "ريال",
        "bh": "دينار", "eg": "جنيه", "jo": "دينار", "iq": "دينار", "lb": "ليرة"
    };

    // ✅ تحديث مفتاح الدولة عند تغيير الدولة
    countrySelect.addEventListener("change", function () {
        let selectedOption = countrySelect.options[countrySelect.selectedIndex];
        let countryCode = selectedOption.getAttribute("data-code");
        phoneCode.textContent = countryCode;
        updatePrice();
    });

    // ✅ تحديث السعر عند تغيير الدولة أو الكمية
    function updatePrice() {
        let country = countrySelect.value;
        let quantity = parseInt(quantitySelect.value) || 1;
        let pricePerPiece = prices[country] || 0;
        let currency = currencies[country] || "";
        let totalPrice = pricePerPiece * quantity;

        priceDisplay.textContent = `💰 السعر: ${totalPrice.toLocaleString()} ${currency}`;
    }

    quantitySelect.addEventListener("change", updatePrice);
    updatePrice();

    // ✅ إرسال الطلب عند النقر على زر الدفع
    document.getElementById("orderForm").addEventListener("submit", function (event) {
        event.preventDefault();

        let name = document.getElementById("name").value.trim();
        let countryName = countrySelect.options[countrySelect.selectedIndex].text;
        let phone = document.getElementById("phone").value.trim();
        let city = document.getElementById("city").value.trim();
        let address = document.getElementById("address").value.trim();
        let postalCode = document.getElementById("postalCode").value.trim();
        let quantity = quantitySelect.value;
        let totalPrice = priceDisplay.textContent;
        let orderNumber = Math.floor(100000 + Math.random() * 900000);

        if (!name || !phone || !city || !address || !postalCode) {
            alert("❌ يرجى تعبئة جميع الحقول المطلوبة.");
            return;
        }

        // ✅ إرسال الطلب إلى تيليجرام
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

        let telegramBotToken = "TOKEN_HERE";
        let telegramChatId = "CHAT_ID_HERE";

        fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
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
                alert("✅ تم إرسال الطلب بنجاح!");
            } else {
                alert("⚠️ حدث خطأ أثناء إرسال الطلب.");
            }
        })
        .catch(error => {
            console.error("❌ خطأ:", error);
            alert("❌ تعذر إرسال الطلب. تحقق من الاتصال بالإنترنت.");
        });
    });

    // ✅ تحميل التقييمات عند فتح الصفحة
    function loadReviews() {
        let storedReviews = JSON.parse(localStorage.getItem("reviews")) || [];
        reviewsList.innerHTML = "";

        if (storedReviews.length === 0) {
            reviewsList.innerHTML = `<p class="text-gray-700">لا توجد تقييمات بعد. كن أول من يشارك برأيه!</p>`;
        } else {
            storedReviews.forEach((review, index) => {
                let reviewElement = document.createElement("div");
                reviewElement.classList = "review bg-white p-3 rounded-lg shadow-md flex justify-between items-center mt-2 relative";
                reviewElement.innerHTML = `
                    <span class="text-gray-800"><strong>${review.rating} ${review.name}:</strong> ${review.comment}</span>
                    <button class="delete-review text-red-500 absolute bottom-1 left-1 p-1 rounded" data-index="${index}">🗑️</button>
                `;
                reviewsList.appendChild(reviewElement);
            });
        }
    }

    loadReviews();

    // ✅ إضافة التقييمات الجديدة
    reviewForm.addEventListener("submit", function (event) {
        event.preventDefault();

        let name = document.getElementById("reviewerName").value.trim();
        let rating = document.getElementById("reviewRating").value;
        let comment = document.getElementById("reviewText").value.trim();

        if (!name || !comment) {
            alert("❌ يرجى إدخال الاسم والتعليق.");
            return;
        }

        let reviews = JSON.parse(localStorage.getItem("reviews")) || [];
        reviews.push({ name, rating, comment });
        localStorage.setItem("reviews", JSON.stringify(reviews));

        loadReviews();
        reviewForm.reset();
    });

    // ✅ حذف تعليق معين
    reviewsList.addEventListener("click", function (event) {
        if (event.target.classList.contains("delete-review")) {
            let index = event.target.getAttribute("data-index");
            let reviews = JSON.parse(localStorage.getItem("reviews")) || [];
            reviews.splice(index, 1);
            localStorage.setItem("reviews", JSON.stringify(reviews));
            loadReviews();
        }
    });

    // ✅ تسجيل الدخول للمالك
    adminLoginButton.addEventListener("click", function () {
        let password = prompt("🔑 أدخل كلمة المرور:");
        if (password === ADMIN_PASSWORD) {
            alert("✅ تسجيل الدخول ناجح!");
            localStorage.setItem("isAdmin", "true");
            logoutButton.classList.remove("hidden");
        } else {
            alert("❌ كلمة المرور غير صحيحة.");
        }
    });

    // ✅ تسجيل الخروج للمالك
    logoutButton.addEventListener("click", function () {
        localStorage.removeItem("isAdmin");
        logoutButton.classList.add("hidden");
        alert("🚪 تم تسجيل الخروج بنجاح.");
    });
});
