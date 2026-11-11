
/* TYCF Food Donation - Package + / - Fix */

(() => {
  "use strict";

  const packages = {
    "Veg Meals": {
      id: "qtyVeg",
      priceId: "vegUnitPrice",
      price: 1500
    },
    "Egg Meals": {
      id: "qtyEgg",
      priceId: "eggUnitPrice",
      price: 1800
    },
    "Chicken Meals": {
      id: "qtyChicken",
      priceId: "chickenUnitPrice",
      price: 2500
    },
    "Cake Celebration": {
      id: "qtyCake",
      priceId: "cakeUnitPrice",
      price: 1500
    }
  };

  function getPrice(item) {
    const priceElement = document.getElementById(item.priceId);

    if (priceElement) {
      const price = Number(
        priceElement.textContent.replace(/[^\d.]/g, "")
      );

      if (price > 0) return price;
    }

    return item.price;
  }

  function getQuantity(input) {
    const value = parseInt(input.value, 10);

    if (isNaN(value)) return 0;

    return Math.max(0, Math.min(100, value));
  }

  function calculateTotal() {
    let total = 0;
    const selected = [];

    Object.entries(packages).forEach(([name, item]) => {
      const input = document.getElementById(item.id);

      if (!input) return;

      const quantity = getQuantity(input);
      input.value = quantity;

      total += quantity * getPrice(item);

      if (quantity > 0) {
        selected.push(name + " × " + quantity);
      }
    });

    const totalElement = document.getElementById("totalAmount");

    if (totalElement) {
      totalElement.textContent =
        "₹" + total.toLocaleString("en-IN");
    }

    const summaryElement =
      document.getElementById("packageSummary");

    if (summaryElement) {
      summaryElement.textContent =
        selected.length
          ? selected.join(" | ")
          : "Select at least one package.";
    }
  }

  // PLUS and MINUS buttons
  document.addEventListener("click", function (event) {
    const button = event.target.closest(
      "[data-package][data-change]"
    );

    if (!button) return;

    const packageName = button.dataset.package;
    const change = Number(button.dataset.change);

    const item = packages[packageName];

    if (!item) return;

    const input = document.getElementById(item.id);

    if (!input) return;

    const current = getQuantity(input);

    input.value = Math.max(
      0,
      Math.min(100, current + change)
    );

    calculateTotal();
  });

  // Manual quantity changes
  Object.values(packages).forEach(item => {
    const input = document.getElementById(item.id);

    if (!input) return;

    input.addEventListener("input", calculateTotal);
    input.addEventListener("change", calculateTotal);
  });

  // Initial total
  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      calculateTotal
    );
  } else {
    calculateTotal();
  }

  window.tycfUpdatePackages = calculateTotal;

})();
