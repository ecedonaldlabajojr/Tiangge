// _______________________ Custom Validator for checking if uploaded file is image _______________________

function imgExtensionValidate(imageFileName) {
    var extension = imageFileName.split('.').pop();
    console.log(extension);
    switch (extension) {
        case 'jpg':
            return 'jpg';
        case 'jpeg':
            return 'jpeg';
        case 'png':
            return 'png';
        default:
            return false;
    }
}


module.exports = imgExtensionValidate;