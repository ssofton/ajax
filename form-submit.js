
$(document).on("click", "button[type='submit'], input[type='submit']", function (e) {
    e.preventDefault();
    let btn = this; // clicked submit button
    let form = $(btn).closest("form"); // find the form
    let formID = form.attr("id"); // get form id
    if (!formID) {
        console.warn("No form ID found — stopping submit");
        return;
    }
    // Get form data
    let formData = new FormData(form[0]);
//    console.log("Clicked Button ID:", btn.id);
//    console.log("Form ID:", formID);
//    console.log("Form Data:", [...formData]);
    let arr = {form_id: formID};
    submit_both(arr, path = actionPath)
            .then((response) => {
                toastalert.showToast(response);
            })
            .catch((error) => {
                console.log(error.message);
                toastalert.showToast({status: "error", message: "Opps!!! Something went wrong: "});
            });
});
function callAjax(arr, path) {
    submit_both(arr, path)
            .then((response) => {
                toastalert.showToast(response);
            })
            .catch((error) => {
                console.log(error.message);
                toastalert.showToast({status: "error", message: "Opps!!! Something went wrong: "});
            });
}
function submit_both(arr, path) {
    return new Promise((resolve, reject) => {
        let formData;
        try {
            formData = getFormData(arr);
        } catch (err) {
            console.error("❌ Error preparing FormData:", err);
            reject({status: "error", message: "Invalid form data."});
            return;
        }

        $.ajax({
            type: "POST",
            url: path,
            data: formData,
            contentType: false,
            processData: false,
            dataType: "text",
            success: function (response) {
//                console.log("✅ Raw Response:", response);
                try {
                    let jsonResponse = JSON.parse(response);
                    resolve(jsonResponse);
                } catch (error) {
                    console.warn("⚠️ Response is not JSON. Treating as HTML.");
                    resolve({status: "html", content: response});
                }
            },
            error: function (xhr, status, error) {
                console.error("❌ AJAX Error:");
                console.error("Status Code:", xhr.status);
                console.error("Status Text:", status);
                console.error("XHR Response:", xhr.responseText);
                console.error("Error Message:", error);

                reject({
                    status: "error",
                    message: `AJAX failed: ${error}`,
                    xhr_status: xhr.status,
                    xhr_response: xhr.responseText,
                });
            }
        });
    });
}

function getFormData(array) {
    let formData;
    if (array instanceof FormData) {
        formData = array;
    } else if ('form_id' in array) {
        var formid = document.getElementById(array['form_id']);
        formData = new FormData(formid);
    } else if (typeof array === 'object') {
        formData = new FormData();
        for (const key in array) {
            if (array.hasOwnProperty(key)) {
                formData.append(key, array[key]);
            }
        }
    } else {
        toastalert.showToast({status: "error", message: "Unable to create FormData "});
    }
    return formData;
}
