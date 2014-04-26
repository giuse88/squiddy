var app = app || {};

(function($) {

    function renderBrowserNotSupportedError() {
        $('#modal-unsupported-dialog').modal({
            show : true,
            backdrop: 'static',
            keyboard: false
        });
    };

    // public
    function main() {
        if ( navigator.sayswho.indexOf('Chrome') > -1 )
            window.application = new app.AppView();
        else
            renderBrowserNotSupportedError();
    }

    app.main = main;

})($);