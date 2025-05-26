document.addEventListener("DOMContentLoaded", function () {
  // Units in Wei - simplified to only Wei, Gwei, and Ether
  const units = {
    wei: "1",
    gwei: "1000000000",
    ether: "1000000000000000000",
  };

  // Get all input fields
  const inputs = {};
  Object.keys(units).forEach((unit) => {
    inputs[unit] = document.getElementById(unit);
  });

  // Function to handle input changes
  function handleInputChange(event) {
    const sourceUnit = event.target.id;
    const sourceValue = event.target.value.trim();

    // Clear other inputs if the source input is empty
    if (!sourceValue) {
      Object.keys(inputs).forEach((unit) => {
        if (unit !== sourceUnit) {
          inputs[unit].value = "";
        }
      });
      return;
    }

    try {
      // Convert source value to wei (base unit)
      let valueInWei;

      // Handle scientific notation and normal numbers
      if (sourceValue.includes("e") || sourceValue.includes("E")) {
        // Scientific notation
        const [mantissa, exponent] = sourceValue.split(/e|E/);
        const mantissaBN = new BigNumber(mantissa);
        const exponentBN = new BigNumber(10).pow(exponent);
        valueInWei = mantissaBN.times(exponentBN).times(units[sourceUnit]);
      } else {
        // Normal number
        valueInWei = new BigNumber(sourceValue).times(units[sourceUnit]);
      }

      // Update all other input fields
      Object.keys(inputs).forEach((unit) => {
        if (unit !== sourceUnit) {
          const convertedValue = valueInWei.div(units[unit]).toString();
          inputs[unit].value = convertedValue;
        }
      });
    } catch (error) {
      console.error("Invalid input:", error);
    }
  }

  // Add event listeners to all inputs
  Object.values(inputs).forEach((input) => {
    input.addEventListener("input", handleInputChange);
  });

  // Clear button functionality
  document.getElementById("clear").addEventListener("click", function () {
    Object.values(inputs).forEach((input) => {
      input.value = "";
    });
  });

  // Copy to clipboard functionality
  const copyButtons = document.querySelectorAll(".copy-btn");
  const notification = document.getElementById("copy-notification");

  copyButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const targetId = this.getAttribute("data-target");
      const targetInput = document.getElementById(targetId);
      const value = targetInput.value;

      if (value) {
        // Copy to clipboard
        navigator.clipboard
          .writeText(value)
          .then(() => {
            showNotification();
            // Visual feedback on the button
            this.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
              this.innerHTML = '<i class="fas fa-copy"></i>';
            }, 1500);
          })
          .catch((err) => {
            console.error("Could not copy text: ", err);
          });
      }
    });
  });

  function showNotification() {
    notification.classList.add("show");
    setTimeout(() => {
      notification.classList.remove("show");
    }, 1500);
  }

  // BigNumber library for handling large numbers and precision
  function BigNumber(value) {
    this.value = value.toString();

    this.times = function (other) {
      if (other instanceof BigNumber) {
        return new BigNumber(
          (Number(this.value) * Number(other.value)).toString()
        );
      } else {
        return new BigNumber((Number(this.value) * Number(other)).toString());
      }
    };

    this.div = function (other) {
      if (other instanceof BigNumber) {
        return new BigNumber(
          (Number(this.value) / Number(other.value)).toString()
        );
      } else {
        return new BigNumber((Number(this.value) / Number(other)).toString());
      }
    };

    this.pow = function (exp) {
      return new BigNumber(
        Math.pow(Number(this.value), Number(exp)).toString()
      );
    };

    this.toString = function () {
      return this.value;
    };

    return this;
  }
});
