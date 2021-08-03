var Uploader = function (el) {
    var self = this;
    this.container = el;
    this.files = {};
    this.filesContailer = el.querySelector('.thumbs');
    this.lastId = 0;

    this.init = function () {
        this.container.querySelector('input[type="file"]').addEventListener('change', function (e) {
            for (var i in e.target.files) {
                if (/^[0-9]*$/.test(i)) {
                    let file = e.target.files[i];
                    let reader = new FileReader();
                    reader.readAsDataURL(file);
                    
                    reader.onload = (function (file) {
                        return function () {
                            var url = reader.result,
                                img = document.createElement('div'),
                                id = self.lastId;

                            self.lastId++;

                            file.content = url;
                            self.files[id] = file;

                            img.className = "image swiper-slide";
                            img.style.backgroundImage = 'url(' + url + ')';
                            img.setAttribute('data-id', id);

                            img.addEventListener('click', self.open);

                            self.filesContailer.appendChild(img);

                            self.swiper.appendSlide(`<div class="swiper-slide"><div class="controls"><div class="info">${file.name}<br/>${new Date(file.lastModified).toLocaleString()}</div><div class="del" data-id="${id}"></div></div><img src="${url}"></div>`);

                            self.attachDel();

                            self.update();
                        }
                    })(file);
                    reader.onerror = function (error) {
                        console.log('Error: ', error);
                    };
                }
            }
        });

        self.swiper = new Swiper(".swiper-container", {
            pagination: {
                el: ".swiper-pagination"
            }
        });

        document.querySelector('.gallery .close').addEventListener('click', function () {
            document.querySelector(".gallery").classList.add('hidden');
        });
    };

    this.init();

    this.attachDel = function () {
        self.swiper.el.querySelectorAll('.del').forEach(function (del) {
            del.onclick = function () {
                self.del(this.dataset.id)
            };
        });
    }

    this.del = function (id) {
        self.swiper.removeSlide(self.swiper.activeIndex);
        self.swiper.update();
        delete self.files[id];
        self.filesContailer.removeChild(self.filesContailer.querySelector('[data-id="' + id + '"]'));

        if (self.swiper.slides.length == 0) {
            document.querySelector(".gallery").classList.add('hidden');
        }

        self.update();
    }

    this.open = function() {
        document.querySelector(".gallery").classList.remove('hidden');
        self.swiper.update();
        self.swiper.slideTo(this.dataset.id, 0);
    }

    this.update = function(callback) {
        var files = [];
        for (var i in self.files) {
            files.push({
                content: self.files[i].content,
                filename: self.files[i].name,
                type: self.files[i].type
            });
        }

        document.querySelector('input[name="transfer"]').value = JSON.stringify(files);
        return;
    }

    return this;
};