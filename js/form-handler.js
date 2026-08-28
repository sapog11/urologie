'use strict';

// Global form handler
const FormHandler = (() => {
  let isSubmitting = false;

  const elements = {
    modal: null,
    form: null,
    submitBtn: null,
    closeBtn: null,
    errorDiv: null,
    successDiv: null,
    nameInput: null,
    emailInput: null,
    phoneInput: null,
    problemInput: null,
  };

  // Initialize form handler
  function init() {
    elements.modal = document.getElementById('appointment-modal');
    elements.form = document.getElementById('appointment-form');
    elements.submitBtn = elements.form?.querySelector('.appointment-form__submit');
    elements.closeBtn = elements.modal?.querySelector('.appointment-modal__close');
    elements.errorDiv = document.getElementById('appointment-error');
    elements.successDiv = document.getElementById('appointment-success');
    elements.nameInput = document.getElementById('appointment-name');
    elements.emailInput = document.getElementById('appointment-email');
    elements.phoneInput = document.getElementById('appointment-phone');
    elements.problemInput = document.getElementById('appointment-problem');

    if (!elements.modal || !elements.form) {
      console.warn('Appointment modal or form not found');
      return;
    }

    attachEventListeners();
  }

  // Attach event listeners
  function attachEventListeners() {
    // Find all appointment buttons
    const appointmentBtns = document.querySelectorAll('[data-appointment-btn]');
    appointmentBtns.forEach((btn) => {
      btn.addEventListener('click', openModal);
    });

    // Floating CTA button
    const floatingCta = document.querySelector('[data-cta-action="book"]');
    if (floatingCta) {
      floatingCta.addEventListener('click', openModal);
    }

    // Form submission
    elements.form.addEventListener('submit', handleFormSubmit);

    // Close button
    if (elements.closeBtn) {
      elements.closeBtn.addEventListener('click', closeModal);
    }

    // Close on backdrop click
    elements.modal.addEventListener('click', handleBackdropClick);
  }

  // Open modal
  function openModal(e) {
    e.preventDefault();
    if (elements.modal) {
      elements.modal.showModal();
    }
  }

  // Close modal
  function closeModal() {
    if (elements.modal) {
      elements.modal.close();
      resetForm();
    }
  }

  // Handle backdrop click
  function handleBackdropClick(e) {
    // Only close if clicking the backdrop, not the content
    const backdrop = e.target.querySelector('.appointment-modal__backdrop');
    if (e.target.id === 'appointment-modal') {
      closeModal();
    }
  }

  // Validate form
  function validateForm() {
    const errors = [];

    const name = elements.nameInput.value.trim();
    const email = elements.emailInput.value.trim();
    const phone = elements.phoneInput.value.trim();
    const problem = elements.problemInput.value.trim();

    if (!name) {
      errors.push('Name is required');
    }

    if (!email) {
      errors.push('Email is required');
    } else if (!isValidEmail(email)) {
      errors.push('Please enter a valid email address');
    }

    if (!phone) {
      errors.push('Phone is required');
    } else if (!isValidPhone(phone)) {
      errors.push('Please enter a valid phone number');
    }

    if (!problem) {
      errors.push('Please describe your problem');
    } else if (problem.length < 10) {
      errors.push('Problem description must be at least 10 characters');
    }

    return errors;
  }

  // Validate email
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate phone
  function isValidPhone(phone) {
    // Accept numbers, spaces, dashes, plus, parentheses
    const phoneRegex = /^[+\d\s\-()]{7,}$/;
    return phoneRegex.test(phone);
  }

  // Handle form submission
  async function handleFormSubmit(e) {
    e.preventDefault();

    // Validate form
    const errors = validateForm();
    if (errors.length > 0) {
      showError(errors.join(', '));
      return;
    }

    if (isSubmitting) {
      return;
    }

    isSubmitting = true;
    elements.submitBtn.disabled = true;
    const originalText = elements.submitBtn.textContent;
    elements.submitBtn.textContent = getLoadingText();

    hideError();
    hideSuccess();

    try {
      const formData = {
        name: elements.nameInput.value.trim(),
        email: elements.emailInput.value.trim(),
        phone: elements.phoneInput.value.trim(),
        problem: elements.problemInput.value.trim(),
      };

      // Call Cloud Function via HTTP
      const functionUrl = 'https://us-central1-urologie-9b2bf.cloudfunctions.net/appointmentForm';

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to send appointment request');
      }

      const result = await response.json();
      showSuccess(result.message || 'Appointment request sent successfully!');
      resetForm();

      // Close modal after 2 seconds
      setTimeout(() => {
        closeModal();
      }, 2000);
    } catch (error) {
      console.error('Error submitting form:', error);
      let errorMessage = 'Failed to send appointment request. Please try again.';

      if (error.message) {
        errorMessage = error.message;
      }

      showError(errorMessage);
    } finally {
      isSubmitting = false;
      elements.submitBtn.disabled = false;
      elements.submitBtn.textContent = originalText;
    }
  }

  // Get loading text based on language
  function getLoadingText() {
    const lang = document.documentElement.lang || 'en';
    const texts = {
      ru: 'Отправка...',
      en: 'Sending...',
      cs: 'Odesílání...',
      uk: 'Надсилання...',
    };
    return texts[lang] || 'Sending...';
  }

  // Show error message
  function showError(message) {
    if (elements.errorDiv) {
      elements.errorDiv.textContent = message;
      elements.errorDiv.hidden = false;
    }
  }

  // Hide error message
  function hideError() {
    if (elements.errorDiv) {
      elements.errorDiv.hidden = true;
      elements.errorDiv.textContent = '';
    }
  }

  // Show success message
  function showSuccess(message) {
    if (elements.successDiv) {
      elements.successDiv.textContent = message;
      elements.successDiv.hidden = false;
    }
  }

  // Hide success message
  function hideSuccess() {
    if (elements.successDiv) {
      elements.successDiv.hidden = true;
      elements.successDiv.textContent = '';
    }
  }

  // Reset form
  function resetForm() {
    elements.form.reset();
    hideError();
    hideSuccess();
  }

  return {
    init,
  };
})();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', FormHandler.init);
} else {
  FormHandler.init();
}
