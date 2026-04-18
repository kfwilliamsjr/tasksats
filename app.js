const simulatePaymentButton = document.getElementById("simulate-payment");
const openInvoiceButton = document.getElementById("open-invoice");
const confirmInvoiceButton = document.getElementById("confirm-invoice");
const invoiceStatus = document.getElementById("invoice-status");
const dialog = document.getElementById("checkout-dialog");
const closeDialogButton = document.getElementById("close-dialog");
const payDialogButton = document.getElementById("pay-dialog");

function markPaid() {
  invoiceStatus.textContent = "Payment confirmed";
  if (simulatePaymentButton) {
    simulatePaymentButton.textContent = "Confirmed";
    simulatePaymentButton.disabled = true;
  }
  if (confirmInvoiceButton) {
    confirmInvoiceButton.textContent = "Marked paid";
    confirmInvoiceButton.disabled = true;
  }
  if (payDialogButton) {
    payDialogButton.textContent = "Paid";
    payDialogButton.disabled = true;
  }
}

if (simulatePaymentButton) {
  simulatePaymentButton.addEventListener("click", markPaid);
}

if (confirmInvoiceButton) {
  confirmInvoiceButton.addEventListener("click", markPaid);
}

if (openInvoiceButton && dialog) {
  openInvoiceButton.addEventListener("click", () => {
    dialog.showModal();
  });
}

if (closeDialogButton && dialog) {
  closeDialogButton.addEventListener("click", () => {
    dialog.close();
  });
}

if (payDialogButton && dialog) {
  payDialogButton.addEventListener("click", () => {
    markPaid();
    dialog.close();
  });
}
