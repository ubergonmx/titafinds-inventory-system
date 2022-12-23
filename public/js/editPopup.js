$(function () {
    $(".remove-image").on("click", function () {
        $("#image-preview").attr("src", `../img/product-images/default.png`);
        $("#image").val("");
    });

    $("#edit-popup").popup({
        blur: false,
        transition: "all 0.3s",
        onclose: function () {
            $("#update-form").trigger("reset");
        },
    });

    $("#edit-form .command :reset").on("click", function () {
        $("#edit-popup").popup("hide");
    });

    $("#edit-popup #selling-type").change(function () {
        var $weight = $("#edit-popup #weight");
        var selectedItem = $(this).val();
        if (selectedItem === "per gram" && $weight.prev().find("span").length == 0) {
            $weight.prev().append('<span style="color: red">*</span>');
        } else {
            $weight.prev().find("span").remove();
        }
    });

    $("#edit-popup form .command :submit").on("click", function (e) {
        e.preventDefault();

        var name = $("#edit-popup #name")[0];
        var code = $("#edit-popup #code")[0];
        var type = $("#edit-popup #type")[0];
        var sellingType = $("#edit-popup #selling-type")[0];
        var weight = $("#edit-popup #weight")[0]; // required if selling type is per gram
        var error = $("#edit-popup .text-error")[0];

        let fields = [name, code, type, sellingType];
        let emptyFields = [];
        fields.forEach(async function (field) {
            if (isEmptyOrSpaces(field.value)) {
                emptyFields.push(field);
            }
        });

        // If selling type is per gram, weight is required
        if (sellingType.value == "per gram") {
            if (isEmptyOrSpaces(weight.value)) {
                emptyFields.push(weight);
            }
        }

        if (emptyFields.length > 0) {
            showError(error, "Please fill out all the fields", emptyFields);
            return;
        }

        const data = new FormData($("#edit-form")[0]);
        data.append("dateUpdated", new Date());

        // if ($("#image-preview").attr("src") == "/img/product-images/default.png") {
        //     data.append("noImage", true);
        // }
        let imagePreview = $("#image-preview").attr("src").replace("../img/", "");
        if (imagePreview == PageItem.image) {
            data.append("noEdit", true);
        }
        if (code.value == PageItem.code) {
            data.append("noNewCode", true);
        }

        //TO BE REMOVED
        for (var pair of data.entries()) {
            console.log(pair[0] + ":" + pair[1]);
        }

        $.ajax({
            url: `/editItem=${PageItem.code}`,
            data: data,
            type: "POST",
            processData: false,
            contentType: false,

            success: async function (foundData) {
                console.log("success");
                let newCode = code.value;
                $("#edit-popup").popup("hide");
                $("#image-preview").attr("src", "/img/product-images/default.png");

                swal({
                    title: "Item edited!",
                    text: "The page will now reload to view changes.",
                    icon: "success",
                    button: "Reload",
                }).then(() => {
                    window.location.href = `/item/${newCode}`;
                });
                // SnackBar({
                //     message: "Item edited successfully",
                //     status: "success",
                //     position: "br",
                //     timeout: 5000,
                //     fixed: true,
                //     actions: [
                //         {
                //             text: "Reload",
                //             function: () => {
                //                 window.location.href = `/item/${newCode.value}`;
                //             },
                //         },
                //     ],
                // });
            },

            error: async function (jqXHR, textStatus, errorThrown) {
                message = jqXHR.responseJSON.message;
                fields = jqXHR.responseJSON.fields;

                if (fields) {
                    fields.forEach(async function (field) {
                        emptyFields.push($(`#${field}`)[0]);
                    });

                    showError(error, message, emptyFields);
                }
            },
        });
    });

    //on change of image
    $("#image").on("change", function () {
        try {
            if (this.files[0]) {
                if (this.files[0].type.match(/image.(jpg|png|jpeg)/)) {
                    if (this.files[0].size <= 1024 * 1024 * 5) {
                        //add in here validation for size
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            $("#image-preview").attr("src", e.target.result);
                        };
                        reader.readAsDataURL(this.files[0]);
                    } else {
                        $("#edit-popup #image").val("");
                        showError($("#edit-popup .text-error")[0], "Image file exceeds 5mb", [
                            $("#image-preview")[0],
                        ]);
                    }
                } else {
                    $("#edit-popup #image").val("");
                    showError($("#edit-popup .text-error")[0], "Please select an image file", [
                        $("#image-preview")[0],
                    ]);
                }
            }
        } catch (error) {
            console.log(error);
        }
    });

    // preventing page from redirecting
    $("html").on("dragover", function (e) {
        e.preventDefault();
        e.stopPropagation();
    });
    $("html").on("drop", function (e) {
        e.preventDefault();
        e.stopPropagation();
    });

    // Drag over
    $("#edit-popup_wrapper").on("dragover", function (e) {
        e.stopPropagation();
        e.preventDefault();
    });
    var counter = 0;
    // Drag enter
    $("#edit-popup_wrapper").on("dragenter", function (e) {
        e.stopPropagation();
        e.preventDefault();
        counter++;
        $("#edit-form").css("opacity", "0.5");
        $("#drag-drop-text").fadeIn(100);
    });
    // Drop
    $("#edit-popup_wrapper").on("drop", function (e) {
        e.stopPropagation();
        e.preventDefault();

        $("#image").prop("files", e.originalEvent.dataTransfer.files);
        $("#image").trigger("change");

        if ($("#drag-drop-text").is(":visible")) {
            $("#edit-form").css("opacity", "1");
            $("#drag-drop-text").fadeOut(100);
        }
    });
    // Drag leave
    $("#edit-popup_wrapper").on("dragleave", function (e) {
        e.stopPropagation();
        e.preventDefault();
        counter--;
        if (counter == 0) {
            $("#edit-form").css("opacity", "1");
            $("#drag-drop-text").fadeOut(100);
        }
    });

    $(document).keydown(function (e) {
        if (e.shiftKey) {
            if (e.which == "69") {
                e.preventDefault();
                // Show the "Edit Item" popup
                $("#edit-popup").popup("show");
            }
        } else if (e.which == "27" && counter > 0) {
            e.preventDefault();
            // Cancel the image drag
            $("#add-form").css("opacity", "1");
            $("#drag-drop-text").fadeOut(100);
            counter = 0;
        }
    });
});