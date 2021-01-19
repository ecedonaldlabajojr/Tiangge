$(document).ready(() => {
    if ($('#ta').length) {
        CKEDITOR.replace('ta')
    };


    $('.delete-btn').on('click', () => {
        if (confirm("Delete page?")) {
            return true;
        } else {
            return false;
        }
    })
});