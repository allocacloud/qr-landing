//=require lib/core.js
//=require lib/swiper.js
//=require lib/app.js
//=require lib/uploader.js

;(function () {
    if (app.env == 'production' && 'serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js');
        });
    }

    function genTree() {
        if (tree) {
            var menu = new App(tree);
        } else {
            setTimeout(genTree, 100);
        }
    }

    if (document.getElementById('tree')) {
        genTree();
    }
})();