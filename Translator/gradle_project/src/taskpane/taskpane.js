/**
 * Sends a POST request to the Flask server at http://localhost:5000/translate with
 * the selected text, target language, temperature, topP, and topK as a JSON object.
 * The response is then displayed in the translation box.
 * @private
 */
function translateSelection() {
    // Get input text and target language
    const inputText = document.getElementById("inputText").value;
    const targetLang = document.getElementById("targetLang").value;

    // Get temperature from the main slider
    const temperature = document.getElementById("temperature").value;
    
    // Check if the advanced settings section is visible; if not, use defaults
    const advancedSettingsDiv = document.getElementById("advancedSettings");
    let topP, topK;
    if (advancedSettingsDiv.style.display === 'none' || advancedSettingsDiv.style.display === '') {
        topP = 0.95;  // default value
        topK = 32;    // default value
    } else {
        topP = document.getElementById("topP").value;
        topK = document.getElementById("topK").value;
    }

    const payload = {
        text: inputText,
        source_lang: "auto",
        target_lang: targetLang,
        temperature: temperature,
        topP: topP,
        topK: topK
    };

    fetch("http://localhost:5000/translate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(translated_text => {
        if (translated_text) {
            showTranslation(translated_text.translated_text);
        } else {
            showTranslation(`Error: ${data.error || "Unknown error"}`);
        }
    })
    .catch(error => {
        showTranslation(`Connection error: ${error.message}`);
    });
}

Office.onReady(() => {
    Office.context.document.addHandlerAsync(
        Office.EventType.DocumentSelectionChanged,
        handleSelectionChange
    );
});

/**
 * Handles the DocumentSelectionChanged event by updating the textarea with the new selection text.
 * @private
 */
function handleSelectionChange() {
    Office.context.document.getSelectedDataAsync(
        Office.CoercionType.Text,
        (asyncResult) => {
            if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
                const selectedText = asyncResult.value.trim();
                if (selectedText) {
                    document.getElementById("inputText").value = selectedText;
                }
            } else {
                console.error("Error retrieving selection: " + asyncResult.error.message);
            }
        }
    );
}


/**
 * Retrieves the currently selected text in the Word document and updates the textarea with the selected text.
 * If no text is selected, it alerts the user to select text and clears the textarea.
 * @private
 */
function getSelectedText() {
    Word.run(async (context) => {
        const selectedRange = context.document.getSelection();
        selectedRange.load("text");

        await context.sync();

        const textArea = document.getElementById("inputText");

        if (selectedRange.text.trim()) {
            textArea.value = selectedRange.text;
        } else {
            textArea.value = "";
            alert("Please select text in the Word document.");
        }
    }).catch((error) => {
        console.error("Error: " + error);
    });
}

/**
 * Updates the #outputText element with the given translation text.
 * @param {string} translation the translated text to display
 * @private
 */
function showTranslation(translation) {
    document.getElementById("outputText").innerText = translation;
}

    document.getElementById('temperature').addEventListener('input', function () {
        document.getElementById('temp-display').innerText = this.value;
    });
    document.getElementById('topP').addEventListener('input', function () {
        document.getElementById('topP-display').innerText = this.value;
    });
    document.getElementById('topK').addEventListener('input', function () {
        document.getElementById('topK-display').innerText = this.value;
    });


    document.getElementById('toggleAdvanced').addEventListener('click', function () {
        const advSettings = document.getElementById('advancedSettings');
        if (advSettings.style.display === 'none' || advSettings.style.display === '') {
            advSettings.style.display = 'flex';
            advSettings.style.flexDirection = 'column';
            this.innerText = 'Hide Advanced Settings';
        } else {
            advSettings.style.display = 'none';
            this.innerText = 'Show Advanced Settings';
        }
});
