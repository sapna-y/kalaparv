/**
 * Kalaparv – Forms & Payment JavaScript
 * Handles: Form Validation, Razorpay Integration, Google Forms, Confirmation
 */

// ===== Razorpay Configuration (Test Mode) =====
const RAZORPAY_CONFIG = {
  key: 'rzp_test_1234567890', // Replace with your actual Razorpay Test Key ID
  amount: 70000, // Amount in paise (₹700 = 70000 paise)
  currency: 'INR',
  name: 'Kalaparv 2026',
  description: 'Event Registration Fee',
  image: '', // Add your logo URL here
  theme: {
    color: '#FF6B00'
  }
};

// ===== Form Validation Helpers =====
function validateName(name) {
  return name.trim().length >= 2;
}

function validateAge(age) {
  const num = parseInt(age);
  return !isNaN(num) && num >= 3 && num <= 99;
}

function validatePhone(phone) {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  return /^(\+91)?[6-9]\d{9}$/.test(cleaned) || /^\d{10}$/.test(cleaned);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateRequired(value) {
  return value.trim().length > 0;
}

function showError(groupId, show = true) {
  const group = document.getElementById(groupId);
  if (group) {
    if (show) {
      group.classList.add('error');
    } else {
      group.classList.remove('error');
    }
  }
}

// ===== Registration Form =====
const registrationForm = document.getElementById('registrationFormEl');

if (registrationForm) {
  // Real-time validation
  const inputs = registrationForm.querySelectorAll('.form-input, .form-select');
  inputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      const group = input.closest('.form-group');
      if (group && group.classList.contains('error')) {
        validateField(input);
      }
    });
  });

  function validateField(input) {
    const name = input.getAttribute('name');
    let isValid = true;

    switch (name) {
      case 'name':
        isValid = validateName(input.value);
        showError('nameGroup', !isValid);
        break;
      case 'age':
        isValid = validateAge(input.value);
        showError('ageGroup', !isValid);
        break;
      case 'category':
        isValid = input.value !== '';
        showError('categoryGroup', !isValid);
        break;
      case 'phone':
        isValid = validatePhone(input.value);
        showError('phoneGroup', !isValid);
        break;
      case 'email':
        isValid = validateEmail(input.value);
        showError('emailGroup', !isValid);
        break;
    }

    return isValid;
  }

  registrationForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('regName').value;
    const age = document.getElementById('regAge').value;
    const category = document.getElementById('regCategory').value;
    const phone = document.getElementById('regPhone').value;
    const email = document.getElementById('regEmail').value;

    // Validate all fields
    let isFormValid = true;

    if (!validateName(name)) { showError('nameGroup'); isFormValid = false; }
    else showError('nameGroup', false);

    if (!validateAge(age)) { showError('ageGroup'); isFormValid = false; }
    else showError('ageGroup', false);

    if (!category) { showError('categoryGroup'); isFormValid = false; }
    else showError('categoryGroup', false);

    if (!validatePhone(phone)) { showError('phoneGroup'); isFormValid = false; }
    else showError('phoneGroup', false);

    if (!validateEmail(email)) { showError('emailGroup'); isFormValid = false; }
    else showError('emailGroup', false);

    if (!isFormValid) return;

    // Store form data
    const formData = { name, age, category, phone, email, timestamp: new Date().toISOString() };

    // Save to localStorage as backup
    const registrations = JSON.parse(localStorage.getItem('kalaparv_registrations') || '[]');
    registrations.push(formData);
    localStorage.setItem('kalaparv_registrations', JSON.stringify(registrations));

    // Initiate Razorpay Payment
    try {
      await initiatePayment(formData);
    } catch (error) {
      console.error('Payment initiation failed:', error);
      // Show confirmation even if payment fails (demo mode)
      showConfirmation();
    }
  });
}

// ===== Razorpay Payment Integration =====
function initiatePayment(formData) {
  return new Promise((resolve, reject) => {
    // Check if Razorpay is loaded
    if (typeof Razorpay === 'undefined') {
      console.log('📌 Razorpay SDK not loaded. Running in demo mode.');
      console.log('📋 Registration Data:', formData);

      // Demo mode: simulate successful payment
      setTimeout(() => {
        showConfirmation();
        sendWhatsAppConfirmation(formData);
        resolve();
      }, 1000);
      return;
    }

    const options = {
      key: RAZORPAY_CONFIG.key,
      amount: RAZORPAY_CONFIG.amount,
      currency: RAZORPAY_CONFIG.currency,
      name: RAZORPAY_CONFIG.name,
      description: RAZORPAY_CONFIG.description,
      image: RAZORPAY_CONFIG.image,
      handler: function (response) {
        console.log('✅ Payment successful:', response);

        // Store payment info
        formData.paymentId = response.razorpay_payment_id;
        const payments = JSON.parse(localStorage.getItem('kalaparv_payments') || '[]');
        payments.push(formData);
        localStorage.setItem('kalaparv_payments', JSON.stringify(payments));

        showConfirmation();
        sendWhatsAppConfirmation(formData);
        resolve(response);
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone
      },
      theme: RAZORPAY_CONFIG.theme,
      modal: {
        ondismiss: function () {
          console.log('Payment dialog dismissed');
          reject(new Error('Payment cancelled'));
        }
      }
    };

    const rzp = new Razorpay(options);
    rzp.on('payment.failed', function (response) {
      console.error('❌ Payment failed:', response.error);
      alert('Payment failed. Please try again or contact us on WhatsApp.');
      reject(response.error);
    });

    rzp.open();
  });
}

// ===== Show Confirmation Modal =====
function showConfirmation() {
  const modal = document.getElementById('confirmationModal');
  if (modal) {
    modal.classList.add('active');

    // Close modal when clicking overlay
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }

  // Reset form
  const form = document.getElementById('registrationFormEl') || document.getElementById('contactFormEl');
  if (form) form.reset();
}

// ===== WhatsApp Auto-Confirmation =====
function sendWhatsAppConfirmation(formData) {
  const message = encodeURIComponent(
    `🎭 *Kalaparv 2026 Registration*\n\n` +
    `✅ Registration received!\n\n` +
    `👤 Name: ${formData.name}\n` +
    `📞 Phone: ${formData.phone}\n` +
    `📧 Email: ${formData.email}\n` +
    `🎪 Category: ${formData.category}\n` +
    `🎂 Age: ${formData.age}\n\n` +
    `Thank you for registering! We'll contact you with further details.\n\n` +
    `– Team Kalaparv | Dream Dance Academy`
  );

  // Open WhatsApp with pre-filled message (for self-notification)
  console.log(`📱 WhatsApp confirmation ready for: ${formData.name}`);
  console.log(`WhatsApp URL: https://wa.me/918920640997?text=${message}`);
}

// ===== Contact Form =====
const contactForm = document.getElementById('contactFormEl');

if (contactForm) {
  // Real-time validation
  const inputs = contactForm.querySelectorAll('.form-input, .form-textarea, .form-select');
  inputs.forEach(input => {
    input.addEventListener('blur', () => validateContactField(input));
    input.addEventListener('input', () => {
      const group = input.closest('.form-group');
      if (group && group.classList.contains('error')) {
        validateContactField(input);
      }
    });
  });

  function validateContactField(input) {
    const name = input.getAttribute('name');
    let isValid = true;

    switch (name) {
      case 'name':
        isValid = validateName(input.value);
        showError('contactNameGroup', !isValid);
        break;
      case 'phone':
        isValid = validatePhone(input.value);
        showError('contactPhoneGroup', !isValid);
        break;
      case 'email':
        if (input.value.trim()) {
          isValid = validateEmail(input.value);
          showError('contactEmailGroup', !isValid);
        } else {
          showError('contactEmailGroup', false);
        }
        break;
      case 'category':
        isValid = input.value !== '';
        showError('contactCategoryGroup', !isValid);
        break;
      case 'message':
        isValid = validateRequired(input.value);
        showError('contactMessageGroup', !isValid);
        break;
    }

    return isValid;
  }

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('contactName').value;
    const phone = document.getElementById('contactPhone').value;
    const email = document.getElementById('contactEmail').value;
    const category = document.getElementById('contactCategory').value;
    const message = document.getElementById('contactMessage').value;

    // Validate
    let isFormValid = true;

    if (!validateName(name)) { showError('contactNameGroup'); isFormValid = false; }
    else showError('contactNameGroup', false);

    if (!validatePhone(phone)) { showError('contactPhoneGroup'); isFormValid = false; }
    else showError('contactPhoneGroup', false);

    if (email && !validateEmail(email)) { showError('contactEmailGroup'); isFormValid = false; }
    else showError('contactEmailGroup', false);

    if (!category) { showError('contactCategoryGroup'); isFormValid = false; }
    else showError('contactCategoryGroup', false);

    if (!validateRequired(message)) { showError('contactMessageGroup'); isFormValid = false; }
    else showError('contactMessageGroup', false);

    if (!isFormValid) return;

    // Disable submit button during submission
    const submitBtn = document.getElementById('contactSubmitBtn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Submitting...';
    }

    // Store message
    const formData = { name, phone, email, category, message, timestamp: new Date().toISOString() };
    const messages = JSON.parse(localStorage.getItem('kalaparv_messages') || '[]');
    messages.push(formData);
    localStorage.setItem('kalaparv_messages', JSON.stringify(messages));

    console.log('📩 Contact form submitted:', formData);

    // Send email submission via FormSubmit AJAX endpoint
    try {
      const response = await fetch("https://formsubmit.co/ajax/kalaparv.festival@gmail.com", {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          "Full Name": name,
          "Phone Number": phone,
          "Email Address": email || "Not provided",
          "Query Category": category,
          "Message": message,
          "Date & Time of Submission": new Date().toLocaleString(),
          "_subject": `New Kalaparv Query - ${category}`
        })
      });
      const data = await response.json();
      console.log('✅ FormSubmit Success:', data);
    } catch (err) {
      console.error('❌ FormSubmit Error:', err);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="icon-3d"><img src="/assets/icons/icon_target.png" alt="Send"></span> Submit Query';
      }
    }

    showConfirmation();
  });
}

// ===== Google Forms Integration (Optional) =====
// To connect to Google Forms:
// 1. Create a Google Form with matching fields
// 2. Get the form action URL and field entry IDs
// 3. Uncomment and configure the function below
/*
async function submitToGoogleForms(formData) {
  const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse';
  const params = new URLSearchParams({
    'entry.FIELD_1': formData.name,
    'entry.FIELD_2': formData.age,
    'entry.FIELD_3': formData.category,
    'entry.FIELD_4': formData.phone,
    'entry.FIELD_5': formData.email,
  });

  try {
    await fetch(GOOGLE_FORM_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    console.log('✅ Data submitted to Google Forms');
  } catch (error) {
    console.error('Google Forms submission failed:', error);
  }
}
*/

console.log('📝 Kalaparv Forms Module Loaded');
