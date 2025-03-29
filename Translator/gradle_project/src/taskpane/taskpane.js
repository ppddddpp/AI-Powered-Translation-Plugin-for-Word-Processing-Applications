function translateSelection() {
const inputText = document.getElementById("inputText").value;
const targetLang = document.getElementById("targetLang").value;

fetch("http://localhost:5000/translate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
    body: JSON.stringify({
        text: inputText,
        source_lang: "auto",
        target_lang: targetLang
    })
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

function showTranslation(translation) {
    document.getElementById("outputText").innerText = translation;
    }
    