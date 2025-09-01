document.addEventListener("DOMContentLoaded", () => {
  // Handle Contact Form
  const form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      alert("Thank you for contacting us! We will reply soon.");
      form.reset();
    });
  }
});
