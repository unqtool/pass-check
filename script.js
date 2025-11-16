// Wait for the DOM to be fully loaded before running scripts
document.addEventListener("DOMContentLoaded", () => {

    // --- Element Selections ---
    const passwordInput = document.getElementById("password-input");
    const togglePasswordBtn = document.getElementById("toggle-password");
    const strengthBar = document.getElementById("strength-bar");
    const strengthText = document.getElementById("strength-text");
    const crackTimeText = document.getElementById("crack-time");
    const checkLength = document.getElementById("check-length");
    const checkUppercase = document.getElementById("check-uppercase");
    const checkLowercase = document.getElementById("check-lowercase");
    const checkNumber = document.getElementById("check-number");
    const checkSymbol = document.getElementById("check-symbol");

    const generatedPasswordInput = document.getElementById("generated-password");
    const copyPasswordBtn = document.getElementById("copy-password");
    const lengthSlider = document.getElementById("length-slider");
    const lengthValue = document.getElementById("length-value");
    const includeUppercase = document.getElementById("include-uppercase");
    const includeLowercase = document.getElementById("include-lowercase");
    const includeNumbers = document.getElementById("include-numbers");
    const includeSymbols = document.getElementById("include-symbols");
    const generateBtn = document.getElementById("generate-btn");

    // --- Password Analyzer Logic ---
    
    // Check if the analyzer elements exist before adding listeners (important for static pages)
    if (passwordInput) {
        passwordInput.addEventListener("input", updateAnalysis);
        togglePasswordBtn.addEventListener("click", () => {
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                togglePasswordBtn.textContent = "Hide";
            } else {
                passwordInput.type = "password";
                togglePasswordBtn.textContent = "Show";
            }
        });
    }


    function updateAnalysis() {
        const password = passwordInput.value;
        
        if (password.length === 0) {
            resetAnalyzer();
            return;
        }

        let strengthScore = 0;

        // 1. Length Check
        const hasLength = password.length >= 8;
        updateChecklistItem(checkLength, hasLength);
        if (hasLength) strengthScore++;

        // 2. Uppercase Check
        const hasUppercase = /[A-Z]/.test(password);
        updateChecklistItem(checkUppercase, hasUppercase);
        if (hasUppercase) strengthScore++;

        // 3. Lowercase Check
        const hasLowercase = /[a-z]/.test(password);
        updateChecklistItem(checkLowercase, hasLowercase);
        if (hasLowercase) strengthScore++;

        // 4. Number Check
        const hasNumber = /[0-9]/.test(password);
        updateChecklistItem(checkNumber, hasNumber);
        if (hasNumber) strengthScore++;

        // 5. Symbol Check
        const hasSymbol = /[^A-Za-z0-9]/.test(password);
        updateChecklistItem(checkSymbol, hasSymbol);
        if (hasSymbol) strengthScore++;

        // Update Strength Bar & Text
        let strengthLabel = "";
        let finalScore = 0;
        if (password.length < 8) {
            finalScore = 0;
            strengthLabel = "Very Weak (Too Short)";
        } else {
            if (strengthScore <= 2) {
                finalScore = 1; // Weak
                strengthLabel = "Weak";
            } else if (strengthScore === 3) {
                finalScore = 2; // Medium
                strengthLabel = "Medium";
            } else if (strengthScore === 4) {
                finalScore = 3; // Strong
                strengthLabel = "Strong";
            } else if (strengthScore === 5) {
                finalScore = 4; // Very Strong
                strengthLabel = "Very Strong";
            }
        }
        
        strengthBar.setAttribute("data-strength", finalScore);
        strengthText.textContent = strengthLabel;
        
        // Update Crack Time
        crackTimeText.textContent = estimateCrackTime(password);
    }

    function updateChecklistItem(element, isValid) {
        if (!element) return; // Safety check
        if (isValid) {
            element.classList.add("valid");
        } else {
            element.classList.remove("valid");
        }
    }

    function resetAnalyzer() {
        strengthBar.setAttribute("data-strength", "0");
        strengthBar.style.width = '0%'; 
        strengthText.textContent = "Enter a password to analyze";
        crackTimeText.textContent = "---";
        updateChecklistItem(checkLength, false);
        updateChecklistItem(checkUppercase, false);
        updateChecklistItem(checkLowercase, false);
        updateChecklistItem(checkNumber, false);
        updateChecklistItem(checkSymbol, false);
    }

    function estimateCrackTime(password) {
        if (!password) return "---";

        // Estimate character pool size
        let charPool = 0;
        if (/[a-z]/.test(password)) charPool += 26;
        if (/[A-Z]/.test(password)) charPool += 26;
        if (/[0-9]/.test(password)) charPool += 10;
        if (/[^A-Za-z0-9]/.test(password)) charPool += 32; 
        if (charPool === 0) charPool = 26; 

        // Use BigInt for high numbers for accuracy
        const combinations = BigInt(charPool) ** BigInt(password.length);
        const guessesPerSecond = 100000000000n; // 100 Billion guesses/sec
        
        const seconds = Number(combinations / guessesPerSecond);

        // Convert seconds to human-readable format
        if (seconds < 1) {
            return "Instantly";
        }
        if (seconds < 60) {
            return `${Math.round(seconds)} second(s)`;
        }
        const minutes = seconds / 60;
        if (minutes < 60) {
            return `${Math.round(minutes)} minute(s)`;
        }
        const hours = minutes / 60;
        if (hours < 24) {
            return `${Math.round(hours)} hour(s)`;
        }
        const days = hours / 24;
        if (days < 365) {
            return `${Math.round(days)} day(s)`;
        }
        const years = days / 365;
        if (years < 1000000) {
            return `${Math.round(years)} year(s)`;
        }
        if (years < 1000000000) {
            return `${Math.round(years / 1000000)} million years`;
        }
        return "Billions of years";
    }

    // --- Password Generator Logic ---

    if (lengthSlider) {
        // Update slider value display
        lengthSlider.addEventListener("input", (e) => {
            lengthValue.textContent = e.target.value;
        });

        // Generate button click
        generateBtn.addEventListener("click", () => {
            const length = parseInt(lengthSlider.value);
            const useUpper = includeUppercase.checked;
            const useLower = includeLowercase.checked;
            const useNumbers = includeNumbers.checked;
            const useSymbols = includeSymbols.checked;

            const password = generatePassword(length, useUpper, useLower, useNumbers, useSymbols);
            generatedPasswordInput.value = password;
        });

        function generatePassword(length, upper, lower, numbers, symbols) {
            let charset = "";
            let password = "";

            if (upper) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            if (lower) charset += "abcdefghijklmnopqrstuvwxyz";
            if (numbers) charset += "0123456789";
            if (symbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";

            if (charset === "") {
                return "Select at least one option";
            }

            // Ensure at least one of each selected type is included
            if (upper) password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
            if (lower) password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
            if (numbers) password += "0123456789"[Math.floor(Math.random() * 10)];
            if (symbols) password += "!@#$%^&*()_+-=[]{}|;:,.<>?"[Math.floor(Math.random() * 30)];

            for (let i = password.length; i < length; i++) {
                password += charset[Math.floor(Math.random() * charset.length)];
            }

            // Shuffle the password to make it random
            return password.split('').sort(() => 0.5 - Math.random()).join('');
        }
    }

    // Copy to Clipboard
    if (copyPasswordBtn) {
        copyPasswordBtn.addEventListener("click", () => {
            if (!generatedPasswordInput.value) return;

            navigator.clipboard.writeText(generatedPasswordInput.value)
                .then(() => {
                    copyPasswordBtn.textContent = "Copied!";
                    setTimeout(() => {
                        copyPasswordBtn.textContent = "Copy";
                    }, 2000);
                })
                .catch(err => {
                    console.error("Failed to copy password: ", err);
                });
        });
        // Generate an initial password on load
        if (generateBtn) generateBtn.click();
    }
});