// ======================================================
// RAZORPAY CHECKOUT SCRIPT
// ======================================================

const RAZORPAY_SCRIPT_URL =
  "https://checkout.razorpay.com/v1/checkout.js";

// ======================================================
// LOAD RAZORPAY CHECKOUT
// ======================================================

export const loadRazorpayScript =
  (): Promise<boolean> => {
    return new Promise(
      (resolve) => {
        // ----------------------------------------------
        // Browser guard
        // ----------------------------------------------

        if (
          typeof window ===
          "undefined"
        ) {
          resolve(false);

          return;
        }

        // ----------------------------------------------
        // Already available
        // ----------------------------------------------

        if (
          window.Razorpay
        ) {
          resolve(true);

          return;
        }

        // ----------------------------------------------
        // Script may already exist but still be loading
        // ----------------------------------------------

        const existingScript =
          document.querySelector<HTMLScriptElement>(
            `script[src="${RAZORPAY_SCRIPT_URL}"]`
          );

        if (
          existingScript
        ) {
          existingScript.addEventListener(
            "load",
            () => {
              resolve(
                Boolean(
                  window.Razorpay
                )
              );
            },
            {
              once: true,
            }
          );

          existingScript.addEventListener(
            "error",
            () => {
              resolve(false);
            },
            {
              once: true,
            }
          );

          return;
        }

        // ----------------------------------------------
        // Create script
        // ----------------------------------------------

        const script =
          document.createElement(
            "script"
          );

        script.src =
          RAZORPAY_SCRIPT_URL;

        script.async = true;

        script.onload =
          () => {
            resolve(
              Boolean(
                window.Razorpay
              )
            );
          };

        script.onerror =
          () => {
            resolve(false);
          };

        document.body.appendChild(
          script
        );
      }
    );
  };