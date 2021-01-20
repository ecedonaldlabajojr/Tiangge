$(document).ready(() => {
    if ($('#ta').length) {
        CKEDITOR.replace('ta')
    };


    $('.delete-btn').on('click', () => {
        if (confirm("Confirm delete?")) {
            return true;
        } else {
            return false;
        }
    })
});