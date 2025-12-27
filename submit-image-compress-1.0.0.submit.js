// <form class="p-3" id="fund_requestx" method="post" data-ajax="true" data-callback="update"></form>
$(document).on("click", "button[type='submit'], input[type='submit']", function (e) {

    let btn = this; // clicked submit button
    let form = $(btn).closest("form"); // find the form

    console.log("data ajax: ", form.data("ajax"));
//    if (form.data("ajax") === false) {
    if (form.data("ajax") !== true) {
        return; // allow PHP POST + page reload
    }

    e.preventDefault();
    let formID = form.attr("id"); // get form id
    if (!formID) {
        console.warn("No form ID found — stopping submit");
        return;
    }
    // Get form data
    let formData = new FormData(form[0]);
    compressImages(formData);
//    console.log("Clicked Button ID:", btn.id);
//    console.log("Form ID:", formID);
//    console.log("Form Data:", [...formData]);
    let arr = {form_id: formID};
    submit_both(arr, path = actionPath)
            .then((response) => {
                const callbackName = form.data("callback");
                if (callbackName && typeof window[callbackName] === "function") {
                    window[callbackName](response);   // call function by name
                } else {
                    toastalert.showToast(response);
                }
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

function compressImages(formData) {
    const filesToCompress = {};

    // Extract all image files from FormData
    for (let [key, value] of formData.entries()) {
        if (value instanceof File && value.type.startsWith("image/")) {
            if (!filesToCompress[key]) {
                filesToCompress[key] = []; // Initialize array for each key (form field)
            }
            filesToCompress[key].push(value); // Store multiple files per key
        }
    }

    if (Object.keys(filesToCompress).length > 0) {
        return new Promise((resolve, reject) => {
            let compressionPromises = [];

            Object.entries(filesToCompress).forEach(([key, files]) => {
                files.forEach(file => {
                    compressionPromises.push(
                            new Promise((resolve, reject) => {
                                new Compressor(file, {
                                    quality: 0.5, // Compression quality
                                    success(result) {
                                        resolve({key, file: result});
                                    },
                                    error(err) {
//                                    console.error("Compression Error:", err.message);
                                        var msg = `Use CDN.
                                        ${err?.message || "Unknown error"}
                                        https://cdn.jsdelivr.net/npm/compressorjs@1.2.1/dist/compressor.min.js`;
                                        toastalert.showToast({status: "error", message: msg});
                                        reject(err);
                                    }
                                });
                            })
                            );
                });
            });

            // Process all compressions
            Promise.all(compressionPromises).then((compressedFiles) => {
                // Delete existing file entries dynamically
                Object.keys(filesToCompress).forEach(key => {
                    formData.delete(key); // Removes only relevant keys
                });

                // Append all compressed files correctly
                compressedFiles.forEach(({ key, file }) => {
                    formData.append(key, file, file.name);
                });

                resolve();
            }).catch(reject);
        });
    } else {
        return Promise.resolve(); // If no images, resolve immediately
    }
}
