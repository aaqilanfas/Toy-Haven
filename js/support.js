(function () {
  "use strict";

  const renderFeedbackHistory = () => {
    const list = document.querySelector("#feedback-history-list");
    const wrap = document.querySelector("#feedback-history-wrap");
    if (!list || !wrap) return;

    const feedback = ToyHaven.readStorage(ToyHaven.STORAGE_KEYS.feedback, []);
    if (!feedback.length) {
      wrap.hidden = true;
      return;
    }

    wrap.hidden = false;
    list.innerHTML = feedback
      .slice(-3)
      .reverse()
      .map(
        (item) => `
          <div class="feedback-history-item">
            <div class="feedback-item-header">
              <strong>${ToyHaven.escapeHtml(item.name)}</strong>
              <span>${item.topic ? ToyHaven.escapeHtml(item.topic) : "General"} · ${new Date(item.submittedAt).toLocaleDateString()}</span>
            </div>
            <p>${ToyHaven.escapeHtml(item.message)}</p>
          </div>
        `
      )
      .join("");
  };

  const initSupport = () => {
    const form = document.querySelector("#feedback-form");
    if (!form) return;

    renderFeedbackHistory();

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = form.elements.name.value.trim();
      const email = form.elements.email.value.trim();
      const topic = form.elements.topic ? form.elements.topic.value : "General";
      const message = form.elements.message.value.trim();
      const feedbackMessage = document.querySelector("#feedback-message");

      if (name.length < 2) {
        feedbackMessage.textContent = "Please enter your name.";
        feedbackMessage.className = "form-message error";
        return;
      }
      if (!email || !email.includes("@")) {
        feedbackMessage.textContent = "Please enter a valid email address.";
        feedbackMessage.className = "form-message error";
        return;
      }
      if (message.length < 5) {
        feedbackMessage.textContent = "Please write a message with at least 5 characters.";
        feedbackMessage.className = "form-message error";
        return;
      }

      const feedback = ToyHaven.readStorage(ToyHaven.STORAGE_KEYS.feedback, []);
      feedback.push({ name, email, topic, message, submittedAt: new Date().toISOString() });
      ToyHaven.writeStorage(ToyHaven.STORAGE_KEYS.feedback, feedback);
      form.reset();

      feedbackMessage.textContent = "🎉 Thanks! Your feedback has been saved locally.";
      feedbackMessage.className = "form-message success";
      ToyHaven.showToast("Feedback submitted successfully! 📨");

      renderFeedbackHistory();
    });

    // Smooth single-open accordion behavior
    document.querySelectorAll(".faq-item").forEach((item) => {
      item.addEventListener("toggle", () => {
        if (!item.open) return;
        document.querySelectorAll(".faq-item").forEach((otherItem) => {
          if (otherItem !== item) otherItem.open = false;
        });
      });
    });
  };

  document.addEventListener("DOMContentLoaded", initSupport);
})();