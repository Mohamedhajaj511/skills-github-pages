// تحديث مفتاح الدولة وتحديث مدة الشحن عند تغيير الدولة
document.getElementById("country").addEventListener("change", function() {
    let country = this.value;
    let shippingText = document.getElementById("shipping-text");
    let countryCode = document.getElementById("country-code");

    switch (country) {
        case "sa": case "qa": case "ae": case "kw": case "om": case "bh":
            shippingText.innerHTML = "🚚 شحن سريع من 1 إلى 7 أيام (الخليج)";
            countryCode.innerHTML = "+966"; // السعودية كمثال
            break;
        case "eg":
            shippingText.innerHTML = "🚚 شحن سريع من 1 إلى 7 أيام (مصر)";
            countryCode.innerHTML = "+20";
            break;
        default:
            shippingText.innerHTML = "🚚 شحن سريع من 1 إلى 10 أيام";
            countryCode.innerHTML = "+961"; // لبنان كمثال
            break;
    }
});

// إرسال الطلب إلى تيليجرام
document.getElementById("orderForm").addEventListener("submit", function(event) {
    event.preventDefault();

    let name = document.getElementById("name").value;
    let address = document.getElementById("address").value;
    let city = document.getElementById("city").value;
    let postalCode = document.getElementById("postalCode").value;
    let country = document.getElementById("country").selectedOptions[0].text;
    let phone = document.getElementById("phone").value;
    let quantity = document.getElementById("quantity").value;

    let message = `📦 *طلب جديد:*\n\n👤 *الاسم:* ${name}\n🏠 *العنوان:* ${address}\n🏙️ *المدينة:* ${city}\n📮 *الرمز البريدي:* ${postalCode}\n🌍 *الدولة:* ${country}\n📞 *رقم الجوال:* ${phone}\n🔢 *الكمية المطلوبة:* ${quantity} قطعة\n🚚 *الشحن:* ${document.getElementById("shipping-text").innerText}`;

    let telegramBotToken = "6961886563:AAHZwl-UaAWaGgXwzyp1vazRu1Hf37FKX2A";
    let telegramChatId = "-1002290156309";

    let telegramUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;

    fetch(telegramUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            chat_id: telegramChatId,
            text: message,
            parse_mode: "Markdown"
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.ok) {
            document.getElementById("orderForm").style.display = "none";
            document.getElementById("confirmationMessage").classList.remove("hidden");
        } else {
            alert("⚠️ حدث خطأ أثناء إرسال الطلب إلى تيليجرام.");
        }
    })
    .catch(error => {
        console.error("❌ خطأ أثناء إرسال الطلب إلى تيليجرام:", error);
        alert("❌ تعذر إرسال الطلب. تحقق من الاتصال بالإنترنت.");
    });
});

// تفعيل Swiper.js للسلايدر
var swiper = new Swiper(".mySwiper", {
    loop: true, 
    autoplay: {
        delay: 3000, 
        disableOnInteraction: false,
    },
    slidesPerView: 1, 
    spaceBetween: 10,
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
});
