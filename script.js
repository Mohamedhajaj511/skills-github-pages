document.addEventListener("DOMContentLoaded", function () {
    // ✅ تعريف متغيرات API
    const JSONBIN_API = "https://api.jsonbin.io/v3/b/67b25350acd3cb34a8e4bf28";
    const JSONBIN_SECRET = "$2a$10$cR8U3fnhRtMfoC722GP31eOWZghfYOja3xo8ZR0OxFM/MbMyG2viq";
    const TELEGRAM_BOT_TOKEN = "6961886563:AAHZwl-UaAWaGgXwzyp1vazRu1Hf37FKX2A";
    const TELEGRAM_CHAT_ID = "-1002290156309";

    // ✅ جلب عناصر الصفحة
    let countrySelect = document.getElementById("country");
    let phoneCode = document.getElementById("country-code");
    let quantitySelect = document.getElementById("quantity");
    let priceDisplay = document.getElementById("priceDisplay");
    let reviewForm = document.getElementById("reviewForm");
    let reviewsList = document.getElementById("reviewsList");
    let orderForm = document.getElementById("orderForm");
    let adminLoginButton = document.getElementById("adminLoginFooter");
    let logoutButton = document.getElementById("logoutAdmin");
    let orderNumberContainer = document.getElementById("orderNumberContainer");
    let orderNumberElement = document.getElementById("orderNumber");

    const ADMIN_PASSWORD = "123456"; // كلمة مرور المالك

    // ✅ التحقق من حالة تسجيل الدخول عند تحميل الصفحة
    function checkAdminLogin() {
        let isAdmin = localStorage.getItem("isAdmin") === "true";
        logoutButton.classList.toggle("hidden", !isAdmin);
        adminLoginButton.classList.toggle("hidden", isAdmin);
        loadReviews();
    }

    checkAdminLogin();

    // ✅ تعريف قائمة العملات والأسعار
    const prices = {
        "sa": 37, "qa": 35, "ae": 36, "kw": 3, "om": 3.7, "bh": 3.8,
        "eg": 300, "jo": 7, "iq": 14500, "lb": 900000
    };

    const currencies = {
        "sa": "ريال", "qa": "ريال", "ae": "درهم", "kw": "دينار", "om": "ريال",
        "bh": "دينار", "eg": "جنيه", "jo": "دينار", "iq": "دينار", "lb": "ليرة"
    };

    // ✅ تحديث السعر عند تغيير الدولة أو الكمية
    function updatePrice() {
        let country = countrySelect.value;
        let quantity = parseInt(quantitySelect.value) || 1;
        let pricePerPiece = prices[country] || 0;
        let currency = currencies[country] || "";
        let totalPrice = pricePerPiece * quantity;
        priceDisplay.textContent = `💰 السعر: ${totalPrice.toLocaleString()} ${currency}`;
    }

    countrySelect.addEventListener("change", function () {
        let selectedOption = countrySelect.options[countrySelect.selectedIndex];
        let countryCode = selectedOption.getAttribute("data-code");
        phoneCode.textContent = countryCode;
        updatePrice();
    });

    quantitySelect.addEventListener("change", updatePrice);
    updatePrice();

    // ✅ إرسال الطلب
    orderForm.addEventListener("submit", function (event) {
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

        orderForm.classList.add("hidden");
        orderNumberElement.textContent = `✅ رقم الطلب: ${orderNumber}`;
        orderNumberContainer.classList.remove("hidden");

        setTimeout(() => {
            orderNumberContainer.classList.add("hidden");
            orderForm.classList.remove("hidden");
        }, 100000);

        let message = `📢 *طلب جديد!* 🚀\n\n` +
                      `👤 *الاسم:* ${name}\n` +
                      `🌍 *الدولة:* ${countryName}\n` +
                      `🏙️ *المدينة:* ${city}\n` +
                      `📍 *العنوان:* ${address}\n` +
                      `📬 *الرمز البريدي:* ${postalCode}\n` +
                      `📞 *رقم الجوال:* ${phone}\n` +
                      `🛒 *الكمية:* ${quantity} قطع\n` +
                      `${totalPrice}`;

        fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: "Markdown"
            })
        });
    });

    // ✅ تحميل التقييمات مباشرة بعد الإضافة بدون تحديث الصفحة
    function loadReviews() {
        fetch(`${JSONBIN_API}/latest`, {
            method: "GET",
            headers: { "X-Master-Key": JSONBIN_SECRET }
        })
        .then(response => response.json())
        .then(data => {
            let reviews = data.record.reviews || [];
            reviewsList.innerHTML = "";
            reviews.forEach((review, index) => {
                let reviewElement = document.createElement("div");
                reviewElement.classList = "review bg-white p-3 rounded-lg shadow-md mt-2 flex justify-between items-center relative";
                reviewElement.innerHTML = `
                    <div class="flex items-center">
                        <img src="https://www.w3schools.com/howto/img_avatar.png" class="w-10 h-10 rounded-full mr-2" alt="User">
                        <span class="text-gray-800"><strong>${review.rating} ${review.name}:</strong> ${review.comment}</span>
                    </div>
                `;
                if (localStorage.getItem("isAdmin") === "true") {
                    let deleteButton = document.createElement("button");
                    deleteButton.textContent = "🗑️";
                    deleteButton.classList = "delete-review text-red-500 absolute bottom-1 left-1 p-1 rounded";
                    deleteButton.addEventListener("click", function () {
                        deleteReview(index);
                    });
                    reviewElement.appendChild(deleteButton);
                }
                reviewsList.appendChild(reviewElement);
            });
        });
    }

    loadReviews();

    // ✅ إضافة التقييم بدون الحاجة لتحديث الصفحة
    reviewForm.addEventListener("submit", function (event) {
        event.preventDefault();

        let name = document.getElementById("reviewerName").value.trim();
        let rating = document.getElementById("reviewRating").value;
        let comment = document.getElementById("reviewText").value.trim();

        if (!name || !comment) {
            alert("❌ يرجى إدخال الاسم والتعليق.");
            return;
        }

        fetch(JSONBIN_API, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "X-Master-Key": JSONBIN_SECRET },
            body: JSON.stringify({ reviews: [{ name, rating, comment }] })
        }).then(() => {
            loadReviews();
            reviewForm.reset();
        });
    });

    // ✅ تسجيل الدخول والخروج بدون تحديث الصفحة
    adminLoginButton.addEventListener("click", function () {
        localStorage.setItem("isAdmin", "true");
        checkAdminLogin();
    });

    logoutButton.addEventListener("click", function () {
        localStorage.removeItem("isAdmin");
        checkAdminLogin();
    });
});
