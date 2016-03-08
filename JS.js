(function(exports, global) {
    global["landing"] = exports;
    function start(redirect_url) {
        $("#landing .login-form").on("submit", function(e) {
            e.preventDefault();
            $(".form-notif").addClass("hidden");
            action = $(this).children(".action").val();
            mail = $(this).children(".mail").val();
            password = $(this).children(".password").val();
            password_conf = $(this).children(".password-confirmation").val();
            action = $(this).attr("data-action");
            if ($(this).attr("data-action") != "passwordReset") {
                console.log(mail.match(/[\.\-\w]+\@[\.\-\w]+\.[\.\-\w]+/));
                if (mail.match(/[\.\-\w]+\@[\.\-\w]+\.[\.\-\w]+/)) {
                    if ($(".password-confirmation").hasClass("hidden") || password == password_conf || password_conf == "") {
                        console.log("submitted");
                        $.ajax({
                            url: "Ajax/connect.php",
                            type: "POST",
                            data: {
                                action: action,
                                mail: mail,
                                password: password,
                                password_conf: password_conf
                            },
                            success: function(data) {
                                console.log(data);
                                if (data != "fail") {
                                    window.location.reload();
                                } else {
                                    $(".form-notif").html("Mauvais mot de passe ou identifiant");
                                    $(".form-notif").removeClass("hidden");
                                }
                            },
                            error: function() {
                                console.log("fail");
                            }
                        });
                    } else {
                        console.log("passwords do not match");
                        $(".form-notif").html("Les mots de passe ne correspondent pas");
                        $(".form-notif").removeClass("hidden");
                    }
                } else {
                    console.log("bad mail");
                    $(".form-notif").html("Votre mail semble être incorrect");
                    $(".form-notif").removeClass("hidden");
                }
            } else {
                console.log(action, mail);
                $.ajax({
                    url: "Ajax/post.php",
                    type: "POST",
                    data: {
                        action: action,
                        mail: mail
                    },
                    success: function(data) {
                        console.log(data);
                        window.location.reload();
                    },
                    error: function() {
                        console.log("fail");
                    }
                });
            }
        });
    }
    function stop() {
        $("#landing > .login-form").off();
    }
    function switchForm() {
        if ($("#landing .login-form").attr("data-action") == "login") {
            landing.switchToSignup();
        } else {
            landing.switchToLogin();
        }
    }
    function switchToLogin() {
        $(".form-notif").addClass("hidden");
        $("#landing .signin").html("S'inscrire");
        $("#landing .center-form .title-form").html("Se connecter");
        $("#landing .login-form").attr("data-action", "login");
        $('*[name="password"]').addClass("borderBottom").removeClass("borderMiddle").removeClass("hidden");
        $('*[name="password-confirmation"]').addClass("hidden");
        $("#landing .center-form .action").removeClass("hidden");
        $("#landing .background").css("background-image", 'url("Assets/Backgrounds/16b.jpg"), url("Assets/Backgrounds/small/16b.jpg")');
    }
    function switchToSignup() {
        $(".form-notif").addClass("hidden");
        $("#landing .signin").html("Se connecter");
        $("#landing .center-form .title-form").html("S'inscrire");
        $("#landing .login-form").attr("data-action", "signup");
        $('*[name="password"]').removeClass("borderBottom").addClass("borderMiddle").removeClass("hidden");
        $('*[name="password-confirmation"]').removeClass("hidden");
        $("#landing .center-form .action").addClass("hidden");
        $("#landing .background").css("background-image", 'url("Assets/Backgrounds/1b.jpg"), url("Assets/Backgrounds/small/1b.jpg")');
    }
    function switchToPasswordReset() {
        $(".form-notif").addClass("hidden");
        $("#landing .signin").html("Se connecter");
        $("#landing .center-form .title-form").html("Réinitialiser votre mot de passe");
        $("#landing .login-form").attr("data-action", "passwordReset");
        $('*[name="password"]').addClass("hidden");
        $('*[name="password-confirmation"]').addClass("hidden");
        $("#landing .center-form .action").addClass("hidden");
        $("#landing .background").css("background-image", 'url("Assets/Backgrounds/1.jpg"), url("Assets/Backgrounds/small/1.jpg")');
    }
    exports["start"] = start;
    exports["stop"] = stop;
    exports["switchForm"] = switchForm;
    exports["switchToLogin"] = switchToLogin;
    exports["switchToSignup"] = switchToSignup;
    exports["switchToPasswordReset"] = switchToPasswordReset;
})({}, function() {
    return this;
}());

(function(exports, global) {
    global["lightbox"] = exports;
    function searchNext(e) {
        var img = $(e).closest(".deletable").next().find("img.zoomPossible")[0];
        var post = $(e).closest(".post").nextUntil("post");
        var i = 0;
        while (i < 30 && typeof img == "undefined" && post.length > 0) {
            post = $(post.get(0));
            img = post.find(".deletable img.zoomPossible")[0];
            post = post.nextUntil("post");
            i++;
        }
        console.log("max iterations: " + i);
        return img;
    }
    function searchPrevious(e) {
        var img = $(e).closest(".deletable").prev().find("img.zoomPossible")[0];
        var post = $(e).closest(".post").prevUntil("post");
        var i = 0;
        while (i < 30 && typeof img == "undefined" && post.length > 0) {
            post = $(post.get(0));
            img = post.find(".deletable img.zoomPossible")[0];
            post = post.prevUntil("post");
            i++;
        }
        console.log("max iterations: " + i);
        return img;
    }
    function enlighten(id) {
        var e = $(id)[0];
        console.log(e.dataset.lightbox);
        if (e.dataset.lightbox != null) {
            var lightbox_src = e.dataset.lightbox;
        } else {
            var lightbox_src = e.src;
        }
        lightbox.darken();
        var node = e;
        var yy = node.offsetTop - 10;
        while (!node.parentNode.className.match(/\.nano-content/) && node.parentNode != document.body) {
            node = node.parentNode;
            yy += node.offsetTop;
        }
        $(".nano-content")[0].scrollTop = yy;
        var next_img = lightbox.searchNext(e);
        var prev_img = lightbox.searchPrevious(e);
        var img = new Image();
        img.onload = function() {
            var nw = this.naturalWidth;
            var nh = this.naturalHeight;
            var width = Math.min(nw, (window.innerWidth - 10) * .95);
            nh = width / nw * nh;
            var height = Math.min(nh, (window.innerHeight - 10) * .95);
            width = height / nh * width;
            $("body").css({
                overflow: "hidden",
                "max-height": "100%"
            });
            var lb = $('<div id="lightbox"></div>');
            if (typeof prev_img != "undefined") {
                $(prev_img).addClass("lightbox_prev");
                unveil(prev_img);
                var prev = $('<div onclick="lightbox.enlighten(\'.lightbox_prev\')" class="prev"><img src="Assets/arrow.png"/></div>');
                $(window).on("keydown", function(e) {
                    if (e.which == 37) {
                        prev.click();
                    }
                });
            }
            if (typeof next_img != "undefined") {
                $(next_img).addClass("lightbox_next");
                unveil(next_img);
                var next = $('<div onclick="lightbox.enlighten(\'.lightbox_next\')" class="next"><img src="Assets/arrow.png"/></div>');
                $(window).on("keydown", function(e) {
                    if (e.which == 39) {
                        next.click();
                    }
                });
            }
            var close = $('<div class="close material-shadow" onclick="lightbox.darken()"><i class="fa fa-close"></i></div>');
            $(this).attr("onclick", "lightbox.darken()").addClass("zoomedImage");
            lb.css({
                top: (window.innerHeight - height) / 2 + "px",
                left: (window.innerWidth - width) / 2 + "px",
                width: width + "px",
                height: height + "px"
            });
            lb.append(next).append(prev).append(this).append(close);
            $("body").append(lb);
            $(window).on("keydown", function(e) {
                if (e.which == 27) {
                    lightbox.darken();
                }
            });
        };
        img.src = lightbox_src;
        mask = $('<div class="lightbox-mask" onclick="lightbox.darken()"></div>');
        mask.append('<div class="spinner"><div class="bg-white bounce1"></div><div class="bg-white bounce2"></div><div class="bg-white bounce3"></div></div>');
        $("body").append(mask);
    }
    function darken() {
        $("#lightbox").remove();
        $(".lightbox-mask").remove();
        $(".lightbox_next").removeClass("lightbox_next");
        $(".lightbox_prev").removeClass("lightbox_prev");
        $(window).off("keydown");
    }
    exports["searchNext"] = searchNext;
    exports["searchPrevious"] = searchPrevious;
    exports["enlighten"] = enlighten;
    exports["darken"] = darken;
})({}, function() {
    return this;
}());

(function(exports, global) {
    global["PF"] = exports;
    function loadVideo(file, id) {
        console.log("load video " + file.name);
        var vid = document.createElement("video");
        vid.controls = true;
        vid.autoplay = true;
        vid.onloadeddata = function() {
            $('*[data-id="' + id + '"]').remove();
            var fileId = createId();
            PF.showVideo(vid, id, fileId);
            PF.sendVideo(file, fileId);
        };
        vid.src = URL.createObjectURL(file);
    }
    function showVideo(vid, id, fileId) {
        var content = $('<span data-src="{:' + fileId + ':}" class="deletable deletable-block" contenteditable="false"></span>');
        content.append(vid);
        $(id).append(content);
        $(id).append('<div contenteditable="true"></div>');
    }
    function sendVideo(vidBlob, fileId) {
        var f = new FormData();
        var uid = $("#info").attr("data-uid");
        f.append("video", vidBlob);
        f.append("fileId", fileId);
        f.append("uid", uid);
        f.append("action", "addVideo");
        var progressBar = $('<div class="progressBar"><div class="progress"></div><div class="conversion"></div></div>');
        $('*[data-src="{:' + fileId + ':}"]').append(progressBar);
        $.ajax({
            url: "Ajax/post.php",
            type: "POST",
            data: f,
            success: function(data) {
                console.log(data);
                console.log("sent !");
                window.sending = window.sending - 1;
            },
            error: function() {
                console.log("fail");
                window.sending = window.sending - 1;
            },
            processData: false,
            contentType: false,
            xhr: function() {
                var xhr = $.ajaxSettings.xhr();
                xhr.upload.onprogress = function(evt) {
                    var p = parseInt(evt.loaded / evt.total * 100);
                    content = $('*[data-src="{:' + fileId + ':}"]');
                    content.find(".progressBar .progress").css("width", p + "%");
                };
                xhr.upload.onload = function() {
                    console.log("done !");
                    setTimeout(function() {
                        trackProgress(fileId);
                    }, 500);
                };
                return xhr;
            }
        });
        window.sending = window.sending + 1;
    }
    function trackProgress(fileId) {
        pid = setInterval(function() {
            console.log("Ajax/get.php?action=getProgess&fileId=" + fileId);
            $.ajax({
                url: "Ajax/get.php",
                type: "GET",
                data: {
                    fileId: fileId,
                    action: "getProgress"
                },
                success: function(data) {
                    console.log(data);
                    if (!data["progress"]) {
                        console.log("endTrack");
                        clearInterval(pid);
                        content = $('*[data-src="{:' + fileId + ':}"]');
                        content.find(".progressBar").remove();
                    } else {
                        content = $('*[data-src="{:' + fileId + ':}"]');
                        var duration = content.find("video")[0].duration;
                        var time = data["progress"].replace(/\r?\n|\r/g, "") / 1e6;
                        var p = time / duration * 100;
                        console.log(p);
                        content.find(".progressBar .conversion").css("width", p + "%");
                    }
                },
                error: function() {
                    console.log("endTrack");
                    clearInterval(pid);
                    content = $('*[data-src="{:' + fileId + ':}"]');
                    content.find(".progressBar").remove();
                }
            });
        }, 1e3);
    }
    function loadImage(file, id) {
        console.log("load image " + file.name);
        var img = new Image();
        img.onload = function() {
            console.log("img:" + img);
            canvas = document.createElement("canvas");
            w = Math.min(this.width, 1024);
            h = Math.min(this.height, 1024);
            g = Math.min(w / img.width, h / img.height);
            canvas.width = this.width * g;
            canvas.height = this.height * g;
            ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, this.width * g, this.height * g);
            delete img;
            var fileId = createId();
            PF.showImage(canvas, id, fileId);
            PF.sendImage(canvas, fileId);
        };
        img.src = URL.createObjectURL(file);
    }
    function showImage(canvas, id, fileId) {
        var content = $('<span data-src="{:' + fileId + ':}" class="deletable deletable-block" contenteditable="false"></span>');
        content.append(canvas);
        $(id).append(content);
        $(id).append('<div contenteditable="true"></div>');
    }
    function sendImage(canvas, fileId) {
        console.log("send image " + name);
        var imgURL = canvas.toDataURL("image/png");
        delete canvas;
        var f = new FormData();
        var uid = $("#info").attr("data-uid");
        f.append("image", dataURItoBlob(imgURL));
        f.append("fileId", fileId);
        f.append("uid", uid);
        f.append("action", "addImage");
        var progressBar = $('<div class="progressBar"><div class="progress"></div></div>');
        $('*[data-src="{:' + fileId + ':}"]').append(progressBar);
        $.ajax({
            url: "Ajax/post.php",
            type: "POST",
            data: f,
            success: function(data) {
                console.log(data);
                window.sending = window.sending - 1;
            },
            error: function() {
                console.log("fail");
                window.sending = window.sending - 1;
            },
            processData: false,
            contentType: false,
            xhr: function() {
                var xhr = $.ajaxSettings.xhr();
                xhr.upload.onprogress = function(evt) {
                    var p = parseInt(evt.loaded / evt.total * 100);
                    console.log("progress", p);
                    content = $('*[data-src="{:' + fileId + ':}"]');
                    content.find(".progressBar .progress").css("width", p + "%");
                };
                xhr.upload.onload = function() {
                    console.log("done !");
                    setTimeout(function() {
                        content = $('*[data-src="{:' + fileId + ':}"]');
                        content.find(".progressBar").remove();
                    }, 1e3);
                };
                return xhr;
            }
        });
        window.sending = window.sending + 1;
    }
    exports["loadVideo"] = loadVideo;
    exports["showVideo"] = showVideo;
    exports["sendVideo"] = sendVideo;
    exports["trackProgress"] = trackProgress;
    exports["loadImage"] = loadImage;
    exports["showImage"] = showImage;
    exports["sendImage"] = sendImage;
})({}, function() {
    return this;
}());

(function(exports, global) {
    global["retouche"] = exports;
    URL = window.URL || window.webkitURL;
    function turn(id, rotation) {
        var img = new Image();
        var canvas = $(id).find("canvas")[0];
        var ctx = canvas.getContext("2d");
        var imgURL = canvas.toDataURL("image/png");
        img.onload = function() {
            delete imgURL;
            var canvas2 = document.createElement("canvas");
            canvas2.height = img.width;
            canvas2.width = img.height;
            canvas2.dataset.h = img.width;
            canvas2.dataset.w = img.height;
            canvas2.style.width = canvas.style.height;
            canvas2.style.height = canvas.style.width;
            var ctx2 = canvas2.getContext("2d");
            ctx2.translate(canvas2.width / 2, canvas2.height / 2);
            ctx2.rotate(rotation);
            ctx2.translate(-canvas2.height / 2, -canvas2.width / 2);
            ctx2.drawImage(img, 0, 0, img.width, img.height);
            $(canvas).after(canvas2);
            $(canvas).remove();
            delete img;
            if ($(id).find(".zone").length != 0) {
                retouche.initHandles(id);
            }
        };
        img.src = imgURL;
    }
    function initHandles(id) {
        z = $(id + " > .zone")[0];
        x = document.querySelector(id).offsetHeight;
        y = document.querySelector(id).offsetWidth;
        w = parseInt($(id).attr("data-w"));
        h = parseInt($(id).attr("data-h"));
        if (w == null || h == null) {
            w = h = 128;
        }
        setZone(z, (x - h) / 2, (y - w) / 2, w, h);
    }
    function addHandles(id) {
        zone = $('<div data-movable="true" class="zone"></div>');
        cachetop = $('<div class="cachetop cache"></div>');
        cachebottom = $('<div class="cachebottom cache"></div>');
        cacheleft = $('<div class="cacheleft cache"></div>');
        cacheright = $('<div class="cacheright cache"></div>');
        handletl = $('<div class="unselectable handlecontainer handletl"><div class="handle"></div></div>');
        handletr = $('<div class="unselectable handlecontainer handletr"><div class="handle"></div></div>');
        handlebl = $('<div class="unselectable handlecontainer handlebl"><div class="handle"></div></div>');
        handlebr = $('<div class="unselectable handlecontainer handlebr"><div class="handle"></div></div>');
        $(id).append(zone);
        $(id).append(cachetop);
        $(id).append(cachebottom);
        $(id).append(cacheleft);
        $(id).append(cacheright);
        $(id).append(handletl);
        $(id).append(handletr);
        $(id).append(handlebl);
        $(id).append(handlebr);
        z = $(id + " > .zone")[0];
        setAsType(z, "movable", null, id);
        retouche.initHandles(id);
        z = $(id + " > .handletl")[0];
        setAsType(z, "resizeHandletl", id + " > .zone", id);
        z = $(id + " > .handletr")[0];
        setAsType(z, "resizeHandletr", id + " > .zone", id);
        z = $(id + " > .handlebl")[0];
        setAsType(z, "resizeHandlebl", id + " > .zone", id);
        z = $(id + " > .handlebr")[0];
        setAsType(z, "resizeHandlebr", id + " > .zone", id);
    }
    function loadCanvas(img, id) {
        window.retouche.img = img;
        canvas = document.createElement("canvas");
        var realw = Math.min(img.width, 1024);
        var realh = Math.min(img.height, 1024);
        var wi = Math.min(img.width, Math.min(1024, Math.min(window.innerWidth, window.innerHeight) - 100));
        var hi = Math.min(img.height, Math.min(1024, Math.min(window.innerWidth, window.innerHeight) - 100));
        console.log(img.height, img.width);
        console.log(hi, wi);
        var g = Math.min(wi / img.width, hi / img.height);
        var realg = Math.min(realw / img.width, realh / img.height);
        console.log(g);
        canvas.width = img.width * realg;
        canvas.height = img.height * realg;
        canvas.style.width = img.width * g;
        canvas.style.height = img.height * g;
        ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, img.width * realg, img.height * realg);
        canvas.dataset.w = img.width * realg;
        canvas.dataset.h = img.height * realg;
        URL.revokeObjectURL(img.src);
        img = null;
        delete img;
        $(id).html(canvas);
        stopInput(id);
        if ($(id).attr("data-action") == "changeAvatar") {
            retouche.addHandles(id);
        }
        var menu = $('<div class="menu"></div>');
        var cancelit = $('<div class="menu-cell"><button onclick="togglenewavatar()" class="material-button">Annuler</button></div>');
        var turnleft = $('<div class="menu-cell"><button onclick="retouche.turn(\'' + id + '\',-Math.PI/2)" class="material-button"><i class="fa fa-rotate-left"></i></button></div>');
        var turnright = $('<div class="menu-cell"><button onclick="retouche.turn(\'' + id + '\',Math.PI/2)" class="material-button"><i class="fa fa-rotate-right"></i></button></div>');
        var sendit = $('<div class="menu-cell"><button onclick="retouche.sendCanvas(\'' + id + '\')" class="material-button">Envoyer</button></div>');
        menu.append(cancelit);
        menu.append(turnleft);
        menu.append(turnright);
        menu.append(sendit);
        $(id).parent().append(menu);
    }
    function loadImage(file, id) {
        console.log("retouche");
        img = new Image();
        img.onload = function() {
            retouche.loadCanvas(img, id);
        };
        img.src = URL.createObjectURL(file);
    }
    function handleFileSelect(evt) {
        id = evt.data;
        console.log(id);
        var file = evt.target.files[0];
        if (file.type.match("image.*")) {
            $(id + " > i").removeClass("fa-photo").addClass("fa-cog fa-spin").css({
                top: "calc(50% - 25px)",
                left: "calc(50% - 25px)"
            });
            loadImage(file, id);
        }
    }
    function setZone(d, x, y, w, h) {
        p = d.parentNode;
        w = Math.max(w, 64);
        h = Math.max(h, 64);
        w = Math.min(w, p.offsetWidth);
        h = Math.min(h, p.offsetHeight);
        g = p.dataset.w / p.dataset.h;
        if (w / h != g) {
            w = g * h;
        }
        x = Math.max(x, 0);
        y = Math.max(y, 0);
        x = Math.min(x, p.offsetHeight - h);
        y = Math.min(y, p.offsetWidth - w);
        x = parseInt(x);
        y = parseInt(y);
        w = parseInt(w);
        h = parseInt(h);
        d.style.width = w;
        d.style.height = h;
        d.style.top = x;
        d.style.left = y;
        ct = d.nextSibling;
        ct.style.height = x;
        cb = ct.nextSibling;
        cb.style.top = x + h;
        cl = cb.nextSibling;
        cl.style.height = h;
        cl.style.width = y;
        cl.style.top = x;
        cr = cl.nextSibling;
        cr.style.height = h;
        cr.style.top = x;
        cr.style.left = y + w;
        htl = cr.nextSibling;
        htl.style.top = x - 12;
        htl.style.left = y - 12;
        htr = htl.nextSibling;
        htr.style.top = x - 12;
        htr.style.left = y - 12 + w;
        hbl = htr.nextSibling;
        hbl.style.top = x - 12 + h;
        hbl.style.left = y - 12;
        hbr = hbl.nextSibling;
        hbr.style.top = x - 12 + h;
        hbr.style.left = y - 12 + w;
    }
    function downEvent(e, d, t, a, id) {
        window.s = new Object();
        window.s.elmt = e.target;
        window.s.type = t;
        window.blockScroll = true;
        if (e.type == "mousedown") {
            cx = e.clientX;
            cy = e.clientY;
        } else {
            cx = e.touches[0].clientX;
            cy = e.touches[0].clientY;
        }
        rect = e.target.getBoundingClientRect();
        offsetX = parseInt(cx - rect.left);
        offsetY = parseInt(cy - rect.top);
        window.s.offsetX = offsetX;
        window.s.offsetY = offsetY;
        window.s.clientX = parseInt(cx);
        window.s.clientY = parseInt(cy);
        window.s.action = document.querySelector(a);
        z = document.querySelector(id + " > .zone");
        window.s.t = parseInt(z.style.top);
        window.s.l = parseInt(z.style.left);
        window.s.w = z.offsetWidth;
        window.s.h = z.offsetHeight;
    }
    function stopInput(id) {
        $(id + " .label").remove();
        $(id + " .underLabel").remove();
        $(id + " input").remove();
    }
    function moveEvent(e) {
        if (window.s != null && window.s.type != null) {
            if (e.type == "mousemove") {
                cx = e.clientX;
                cy = e.clientY;
            } else {
                cx = e.touches[0].clientX;
                cy = e.touches[0].clientY;
            }
            if (window.s.type == "movable") {
                r = window.s.elmt.parentNode.getBoundingClientRect();
                t = cy - r.top - window.s.offsetY;
                l = cx - r.left - window.s.offsetX;
                w = window.s.w;
                h = window.s.h;
                if (l != window.s.l || t != window.s.t) {
                    setZone(window.s.elmt, t, l, w, h);
                }
            }
            if (window.s.type[0] == "r") {
                target = window.s.action;
                t = window.s.t;
                l = window.s.l;
                w = window.s.w;
                h = window.s.h;
                mx = cx - window.s.clientX;
                my = cy - window.s.clientY;
                g = 0;
                if (window.s.type == "resizeHandletl") {
                    g = (-mx - my) / 2;
                    t = t - g;
                    l = l - g;
                }
                if (window.s.type == "resizeHandletr") {
                    g = (mx - my) / 2;
                    t = t - g;
                }
                if (window.s.type == "resizeHandlebl") {
                    g = (-mx + my) / 2;
                    l = l - g;
                }
                if (window.s.type == "resizeHandlebr") {
                    g = (mx + my) / 2;
                }
                w = w + g;
                h = h + g;
                if (t != window.s.t || l != window.s.l || w != window.s.w || h != window.s.h) {
                    setZone(target, t, l, w, h);
                }
            }
        }
    }
    function setAsType(d, t, a, id) {
        d.addEventListener("mousedown", function(e) {
            downEvent(e, d, t, a, id);
        }, false);
        d.addEventListener("touchstart", function(e) {
            downEvent(e, d, t, a, id);
        }, false);
    }
    function start(id) {
        document.body.addEventListener("mousemove", function(e) {
            moveEvent(e);
        }, false);
        document.body.addEventListener("touchmove", function(e) {
            moveEvent(e);
        }, false);
        document.body.addEventListener("mouseup", function() {
            window.s = null;
        }, false);
        document.body.addEventListener("touchend", function() {
            window.s = null;
            window.blockScroll = false;
        }, false);
        $(window).on("touchmove", function(e) {
            if (window.blockScroll) {
                e.preventDefault();
            }
        });
        restart(id);
    }
    function restart(id) {
        $(id + " input").off();
        $(id + " input").on("change", null, id, handleFileSelect);
    }
    function stop(id) {
        $(id + " > input").off();
    }
    function set(id, src) {
        var img = new Image();
        img.onload = function() {
            loadCanvas(img, id);
        };
        img.src = src;
    }
    function sendCanvas(id) {
        console.log("coucou");
        canvas = document.querySelector(id + " canvas");
        var ctx = canvas.getContext("2d");
        var action = $(id).attr("data-action");
        var arg = $(id).attr("data-arg");
        if (action == "changeAvatar") {
            g = canvas.offsetWidth / parseInt(canvas.dataset.w);
            z = document.querySelector(id + " > .zone");
            l = parseInt(z.style.left) / g;
            t = parseInt(z.style.top) / g;
            w = parseInt(z.style.width) / g;
            h = parseInt(z.style.height) / g;
            data = ctx.getImageData(l, t, w, h);
            var nw = $(id).attr("data-w");
            var nh = $(id).attr("data-h");
            if (nw != null && nh != null) {
                g = Math.min(Math.max(w, nw) / w, Math.max(h, nh) / h);
            } else {
                g = Math.min(Math.max(w, 1024) / w, Math.max(h, 1024) / h);
            }
        } else {
            g = 1;
            w = $(id).find("canvas").attr("data-w");
            h = $(id).find("canvas").attr("data-h");
            data = ctx.getImageData(0, 0, canvas.dataset.w, canvas.dataset.h);
            console.log("plop");
        }
        console.log(w, h);
        c2 = document.createElement("canvas");
        c2.width = parseInt(w);
        c2.height = parseInt(h);
        ctx2 = c2.getContext("2d");
        ctx2.putImageData(data, 0, 0);
        imgURL = c2.toDataURL("image/png");
        delete c2;
        delete ctx2;
        c3 = document.createElement("canvas");
        c3.width = parseInt(w * g);
        c3.height = parseInt(h * g);
        ctx3 = c3.getContext("2d");
        ctx3.transform(g, 0, 0, g, 0, 0);
        var htmlImage = new Image();
        console.log("f1");
        htmlImage.onload = function() {
            console.log("f3");
            ctx3.drawImage(htmlImage, 0, 0);
            delete imgURL;
            imgURL = c3.toDataURL("image/png");
            delete c3;
            delete ctx3;
            delete htmlImage;
            f = new FormData();
            f.append("image", dataURItoBlob(imgURL));
            var uid = $("#info").attr("data-uid");
            var fid = $("#info").attr("data-fid");
            f.append("uid", uid);
            f.append("fid", fid);
            f.append("action", action);
            console.log(action);
            f.append("fileId", arg);
            $.ajax({
                url: "Ajax/post.php",
                type: "POST",
                data: f,
                success: function(data) {
                    console.log(data);
                    console.log("sent!");
                    location.reload();
                },
                error: function() {
                    console.log(uid, fid, action);
                },
                processData: false,
                contentType: false
            });
            var loading_retouche = $('<div class="loading-retouche"><div class="spinner"><div class="bg-white bounce1"></div><div class="bg-white bounce2"></div><div class="bg-white bounce3"></div></div></div>');
            $(id).parent().append(loading_retouche);
        };
        htmlImage.src = imgURL;
        console.log(imgURL);
        console.log("f2");
    }
    exports["turn"] = turn;
    exports["initHandles"] = initHandles;
    exports["addHandles"] = addHandles;
    exports["loadCanvas"] = loadCanvas;
    exports["loadImage"] = loadImage;
    exports["handleFileSelect"] = handleFileSelect;
    exports["setZone"] = setZone;
    exports["downEvent"] = downEvent;
    exports["stopInput"] = stopInput;
    exports["moveEvent"] = moveEvent;
    exports["setAsType"] = setAsType;
    exports["start"] = start;
    exports["restart"] = restart;
    exports["stop"] = stop;
    exports["set"] = set;
    exports["sendCanvas"] = sendCanvas;
})({}, function() {
    return this;
}());

function recordUsage(usage) {
    $.ajax({
        url: "Ajax/post.php",
        type: "post",
        data: {
            action: "recordUsage",
            usage: usage
        },
        success: function(data) {
            console.log(data);
        },
        error: function() {
            console.log("fail record");
        }
    });
}

function toggleButterfly(t) {
    var pid = $(t).closest(".post").attr("data-id");
    var uid = $("#info").attr("data-uid");
    var fid = $("#info").attr("data-fid");
    recordUsage("butterfly");
    $.ajax({
        url: "Ajax/post.php",
        type: "POST",
        data: {
            action: "toggleButterfly",
            uid: uid,
            fid: fid,
            pid: pid
        },
        success: function(data) {
            console.log(data);
            var butterflies = $(t).parent()[0].childNodes[3].textContent;
            $(t).parent()[0].childNodes[3].textContent = data["count"];
            t.style.fill = data["color"];
        },
        error: function() {
            console.log("fail butterfly");
        }
    });
}

function getMoreComments(pid) {
    var uid = $("#info").attr("data-uid");
    var fid = $("#info").attr("data-fid");
    $.ajax({
        url: "Ajax/get.php",
        type: "GET",
        data: {
            action: "getMoreComments",
            uid: uid,
            fid: fid,
            pid: pid
        },
        success: function(data) {
            console.log(data);
            $("#post-viewer .more_comments").after(data["html"]);
            $("#post-viewer .more_comments").remove();
            lazyload($(".nano-content")[0]);
        },
        error: function() {
            console.log("fail more_comments");
        }
    });
}

function updatePostStats(pid) {
    var uid = $("#info").attr("data-uid");
    var fid = $("#info").attr("data-fid");
    $.ajax({
        url: "Ajax/get.php",
        type: "GET",
        data: {
            action: "getPostStats",
            uid: uid,
            fid: fid,
            pid: pid
        },
        success: function(data) {
            console.log(data);
            if (typeof data != "undefined" && typeof data["coms"] != "undefined") {
                if (data["coms"] != 0) {
                    $('#container .post-mini[data-id="' + pid + '"]').find(".stats").remove();
                    $('#container .post-mini[data-id="' + pid + '"]').append('<div class="stats"><div class="comments-indicator"><div>' + data["coms"] + ' <i class="fa fa-comment"></i></div></div></div>');
                    if (data["unread"] == true) {
                        $('.post-mini[data-id="' + pid + '"] .comments-indicator div').addClass("newcom");
                    }
                } else {
                    $('#container .post-mini[data-id="' + pid + '"]').find(".stats").remove();
                }
            }
        }
    });
}

function changeSecretLink() {
    var uid = $("#info").attr("data-uid");
    var fid = $("#info").attr("data-fid");
    $.ajax({
        url: "Ajax/post.php",
        type: "POST",
        data: {
            action: "changeSecretLink",
            uid: uid,
            fid: fid
        },
        success: function(data) {
            console.log(data);
            window.location.reload();
        }
    });
}

function removeUserFromForum() {
    var uid = $("#info").attr("data-uid");
    var fid = $("#info").attr("data-fid");
    $.ajax({
        url: "Ajax/post.php",
        type: "POST",
        data: {
            action: "removeUserFromForum",
            uid: uid,
            fid: fid
        },
        success: function(data) {
            console.log(data);
            window.location = location.protocol + "//" + location.host + location.pathname;
        },
        error: function() {
            console.log("fail to remove forum");
        }
    });
}

function loadRetoucheBox(w, h, action) {
    r = $("#retoucheBox");
    r.attr("data-w", w);
    r.attr("data-h", h);
    r.attr("data-action", action);
    showimageeditor("#retoucheBox");
}

function destroyAccount(id) {
    var password = $(id).val();
    if (password == null || password.match(/^\s*$/)) {
        return false;
    }
    var uid = $("#info").attr("data-uid");
    console.log(password, uid);
    $.ajax({
        url: "Ajax/post.php",
        type: "POST",
        data: {
            action: "destroyAccount",
            uid: uid,
            password: password
        },
        success: function(data) {
            console.log(data);
            disconnect();
        }
    });
}

function changeforumname(id) {
    name = $(id).val();
    if (name == null || name.match(/^\s*$/)) {
        return false;
    }
    var uid = $("#info").attr("data-uid");
    var fid = $("#info").attr("data-fid");
    $.ajax({
        url: "Ajax/post.php",
        type: "POST",
        data: {
            action: "changeForum",
            uid: uid,
            fid: fid,
            name: name
        },
        success: function(data) {
            console.log(data);
            location.reload();
        }
    });
}

function changename(id) {
    name = $(id).val();
    if (name == null || name.match(/^\s*$/)) {
        return false;
    }
    var uid = $("#info").attr("data-uid");
    $.ajax({
        url: "Ajax/post.php",
        type: "POST",
        data: {
            action: "changeProfile",
            uid: uid,
            name: name
        },
        success: function(data) {
            console.log(data);
            location.reload();
        }
    });
}

function inviteUser(id) {
    if (id.match(/.+@.+/)) {
        mail = id;
    } else {
        mail = $(id).val();
    }
    if (mail == "" || typeof mail == "undefined") {
        return false;
    }
    console.log(mail);
    uid = $("#info").attr("data-uid");
    fid = $("#info").attr("data-fid");
    console.log(uid, fid);
    $.ajax({
        url: "Ajax/post.php",
        type: "POST",
        data: {
            action: "inviteUser",
            uid: uid,
            mail: mail,
            fid: fid
        },
        success: function(data) {
            console.log(data);
            console.log("success!");
            window.location.reload(true);
        },
        error: function() {
            console.log("fail!");
        }
    });
}

function changepassword(old_id, new_id) {
    old_password = $(old_id).val();
    new_password = $(new_id).val();
    if (old_password == null || old_password.match(/^\s*$/)) {
        return false;
    }
    if (new_password == null || new_password.match(/^\s*$/)) {
        return false;
    }
    var uid = $("#info").attr("data-uid");
    $.ajax({
        url: "Ajax/post.php",
        type: "POST",
        data: {
            action: "changeProfile",
            uid: uid,
            old_password: old_password,
            new_password: new_password
        },
        success: function(data) {
            console.log(data);
            location.reload();
        }
    });
}

function sendIt(id) {
    msg = "";
    if (id == "#commentBox" || id == "#editBox") {
        var parentID = $("#post-viewer").attr("data-id");
    } else {
        var parentID = 0;
    }
    if (id == "#editBox") {
        var pid = $(id).parent().attr("data-id");
    } else {
        var pid = 0;
    }
    t = $(id);
    for (i = 0; i < t.children().length; i++) {
        c = $(t.children()[i]);
        if (c.hasClass("deletable")) {
            msg += " " + c.attr("data-src");
        } else {
            msg += " " + decode(c.html());
        }
    }
    uid = $("#info").eq(0).attr("data-uid");
    forum = $("#info").eq(0).attr("data-fid");
    console.log("text:" + msg + ",forum:" + forum + ",uid:" + uid + ",parent:" + parentID + ",pid:" + pid);
    var baliseId = createId();
    $.ajax({
        url: "Ajax/save_msg.php",
        type: "POST",
        data: {
            text: msg,
            forum: forum,
            uid: uid,
            parent: parentID,
            pid: pid
        },
        success: function(data) {
            console.log(data);
            if (data["parent"] == 0 || data["parent"] == null) {
                console.log("new post");
                var balise = $('#container div[data-balise="' + baliseId + '"]');
                if (data["miniature"] != null) {
                    balise.after('<div class="material-shadow post-mini" data-id="' + data["id"] + '"><div class="post-preview"><img src="' + data["miniature"] + '"/></div></div>');
                } else {
                    balise.after('<div class="material-shadow post-mini" data-id="' + data["id"] + '"><div class="post-preview">' + data["html_preview"] + "</div></div>");
                }
                balise.remove();
                hidepostviewer();
            } else {
                if (data["pid"] == 0 || data["pid"] == null) {
                    console.log("new com");
                    var balise = $('.child-post[data-balise="' + baliseId + '"]');
                    balise.after(data["html"]);
                    balise.remove();
                    typebox.view();
                    var p = $("#container .post-mini[data-id=" + data["parent"] + "]");
                    p.remove();
                    $("#container").prepend(p);
                    updatePostStats(data["parent"]);
                } else {
                    if (data["parent"] == data["pid"]) {
                        console.log("edit post");
                        var pp = $(".parent-post");
                        pp.after(data["html"]);
                        pp.remove();
                        typebox.view();
                        var p = $("#container .post-mini[data-id=" + data["pid"] + "]");
                        if (data["miniature"] != null) {
                            p.after('<div class="material-shadow post-mini" data-id="' + data["pid"] + '"><img src="' + data["miniature"] + '"/></div>');
                        } else {
                            p.after('<div class="material-shadow post-mini" data-id="' + data["pid"] + '">' + data["html_preview"] + "</div>");
                        }
                        p.remove();
                    } else {
                        console.log("edit com");
                        var balise = $(".child-post[data-id=" + data["pid"] + "]");
                        balise.after(data["html"]);
                        balise.remove();
                    }
                }
            }
            setpostsviewable();
        },
        error: function(a, b, c) {
            console.log(a, b, c);
        }
    });
    if (parentID == 0 || parentID == null) {
        if (pid == 0 || pid == null) {
            var post_loading = $('<div data-balise="' + baliseId + '" class="post-mini"><div class="spinner"><div class="bg-orange bounce1"></div><div class="bg-orange bounce2"></div><div class="bg-orange bounce3"></div></div></div>');
            $("#container").prepend(post_loading);
            push_hidenewpost(true);
        }
    } else {
        if (pid == 0 || pid == null) {
            hidenewcommentsection($(".new-comment-section"));
            var com_loading = $('<div class="post child-post" data-balise="' + baliseId + '"><div class="spinner"><div class="bg-white bounce1"></div><div class="bg-white bounce2"></div><div class="bg-white bounce3"></div></div></div>');
            $(".new-comment-section").before(com_loading);
        }
    }
}

function setpostsviewable() {
    $(".post-mini").off();
    $(".post-mini").on("click", function(e) {
        var id = $(e.currentTarget).attr("data-id");
        push_showpost(id);
    });
}

function deletePost(t) {
    if (confirm("Voulez-vous vraiment supprimer ce message ?")) {
        var p = $(t).closest(".post");
        var id = p.attr("data-id");
        console.log("delete:" + id);
        var forum = $("#info").attr("data-fid");
        $.ajax({
            url: "Ajax/post.php",
            type: "POST",
            data: {
                action: "deletePost",
                id: id,
                forum: forum
            },
            success: function(data) {
                console.log(data);
                if (p.hasClass("parent-post")) {
                    hidepostviewer();
                    $('#container .post-mini[data-id="' + id + '"]').remove();
                } else {
                    $('.post[data-id="' + id + '"]').remove();
                }
                var ppid = $("#post-viewer").attr("data-id");
                updatePostStats(ppid);
            }
        });
    }
}

function editPost(t) {
    recordUsage("edit");
    var p = $(t).closest(".post");
    var pid = p.attr("data-id");
    $.ajax({
        url: "Ajax/get.php",
        type: "get",
        data: {
            action: "getRaw",
            pid: pid
        },
        success: function(data) {
            box = '<div id="editBox" class="dynamicBox">';
            box += '<div contenteditable="true" data-placeholder="Ecrivez quelque chose...">' + data["raw"] + "</div>";
            box += "</div>";
            box += '<div class="menu">';
            box += '<div class="menu-cell">';
            box += '<button id="cancelit" onclick="hidepostviewer()">Annuler</button>';
            box += "</div>";
            box += '<div class="menu-cell">';
            box += '<button id="sendit" onclick="sendIt(\'#editBox\')">Envoyer</button>';
            box += "</div>";
            box += "</div>";
            p.html(box);
            typebox.start("#editBox");
            typebox.evaluate("#editBox");
        }
    });
}

function loadMorePosts() {
    if (!window.loading_posts) {
        recordUsage("morePosts");
        console.log("trying to load posts");
        window.loading_posts = true;
        var list = $("#container .post-mini").map(function() {
            var t = this.dataset.id;
            return t;
        }).get();
        list = JSON.stringify(list);
        var fid = $("#info").attr("data-fid");
        var width = window.innerWidth;
        if (width > 680) {
            width = width - 200;
        }
        var height = window.innerHeight;
        var margin = 10;
        var ncol = parseInt(width / (320 + margin));
        var nlin = parseInt(height / (180 + margin));
        var number = ncol * (nlin + 1);
        console.log(ncol, nlin, number);
        $.ajax({
            url: "Ajax/post.php",
            type: "POST",
            data: {
                action: "morePost",
                fid: fid,
                list: list,
                number: number
            },
            success: function(data) {
                console.log(data);
                if (typeof data != "undefined" && data != "") {
                    if (data["count"] > 0) {
                        $("#container").append(data["html"]);
                    }
                    console.log("loaded (" + data["count"] + ")");
                    if (data["end"] == true) {
                        console.log("all posts are here !");
                        $(document).unbind("scroll");
                    }
                    setpostsviewable();
                    window.loading_posts = false;
                }
            },
            error: function() {
                console.log("fail to load more posts");
                window.loading_posts = false;
            }
        });
    }
}

function disconnect() {
    recordUsage("disconnect");
    $.ajax({
        url: "Ajax/connect.php",
        type: "POST",
        data: {
            mail: "",
            password: ""
        },
        success: function(data) {
            document.cookie = "auth_token" + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
            window.location = location.protocol + "//" + location.host + location.pathname;
        }
    });
}

function cancelAsk() {
    $("#ask").remove();
    removeMask("askMask");
}

function answerAsk(callback, args) {
    var r = $("#ask input").val();
    cancelAsk();
    callback(r, args);
}

function ask(question, maxlength, callback, args) {
    var dialog_div = $('<div id="ask"></div>');
    var body = $("<span>" + question + "</span>");
    var user_input = $('<input type="text" maxlength="' + maxlength + '"></input>');
    var submit_button = $("<button>Ok</button>");
    submit_button.on("click", function() {
        answerAsk(callback, args);
    });
    var cancel_button = $('<button onclick="cancelAsk()">Annuler</button>');
    dialog_div.append(body).append(user_input).append(submit_button).append(cancel_button);
    $("body").append(dialog_div);
    addMask("cancelAsk()", .4, 9e3, "askMask");
}

function addForum(name) {
    if (name == null || name.match(/^\s*$/)) {
        return false;
    }
    uid = $("#info").attr("data-uid");
    $.ajax({
        url: "Ajax/post.php",
        type: "POST",
        data: {
            action: "addForum",
            uid: uid,
            name: name
        },
        success: function(data) {
            console.log(data);
            console.log("success!");
            if (typeof data != "undefined") {
                window.location.href = data["link"];
            } else {
                window.location.reload(true);
            }
        },
        error: function() {
            console.log("fail!");
        }
    });
}

function addUserToForum(t) {
    nid = $(t).parent().attr("data-id");
    uid = $("#info").attr("data-uid");
    $.ajax({
        url: "Ajax/post.php",
        type: "POST",
        data: {
            action: "addUserToForum",
            uid: uid,
            nid: nid
        },
        success: function(data) {
            console.log(data);
            console.log("success!");
            if (typeof data != "undefined") {
                window.location.href = data["link"];
            } else {
                window.location.reload(true);
            }
        },
        error: function() {
            console.log("fail!");
        }
    });
    $(t).parent().remove();
}

function removeNotification(t) {
    nid = $(t).parent().attr("data-id");
    console.log(nid);
    console.log(t);
    uid = $("#info").attr("data-uid");
    $.ajax({
        url: "Ajax/post.php",
        type: "POST",
        data: {
            action: "removeNotification",
            uid: uid,
            nid: nid
        },
        success: function(data) {
            console.log(data);
            console.log("success!");
        },
        error: function() {
            console.log("fail!");
        }
    });
    $('*[data-id="' + nid + '"]').remove();
}

function inputFile(id) {
    input = $('<input class="hidden" data-id="' + id + '" type="file" multiple></input>');
    input.on("change", handleFileSelect);
    $("body").append(input);
    input.click();
}

function handleFileSelect(evt) {
    var files = evt.target.files;
    var id = evt.target.dataset.id;
    console.log("change!");
    file = files[0];
    console.log(file);
    console.log(files);
    if (files.length > 20) {
        alert("Le nombre maximum de fichier que vous pouvez envoyer en même temps est 20");
        return false;
    } else {
        for (var i = 0; i < files.length; i++) {
            handleFile(files[i], id);
        }
    }
    evt.target.value = null;
}

function handleFile(file, id) {
    console.log(file);
    var fileTypeHandled = false;
    if (file.type.match(/image/)) {
        fileTypeHandled = true;
        if (file.size > 1024 * 1024 * 30) {
            alert("fichier image trop lourd (max 30Mo)");
        } else {
            PF.loadImage(file, id);
        }
    }
    if (file.type.match(/video/)) {
        fileTypeHandled = true;
        if (file.size > 1024 * 1024 * 300) {
            alert("fichier vidéo trop lourd (max 300Mo)");
        } else {
            PF.loadVideo(file, id);
        }
    }
    if (!fileTypeHandled) {
        alert("Le format du fichier n'est pas supporté");
    }
}

function loadImage(t) {
    t = $(t).closest(".launcher");
    t.on("click", function() {
        return false;
    });
    var src = t.attr("data-src");
    var img = $('<img class="inlineImage" onerror="error_im(this)" src="' + src + '"/>');
    img.on("load", function() {
        t.after(img);
        img.off();
        t.remove();
    });
    t.addClass("launcher-loading");
}

function loadVideo(t) {
    t = $(t).closest(".launcher");
    t.on("click", function() {
        console.log("spam");
        return false;
    });
    var src = t.attr("data-src");
    var vid = $('<video class="inlineImage" controls loop autoplay src="' + src + '"></video>');
    vid.on("canplay", function() {
        t.after(vid);
        vid.off();
        t.remove();
    });
    t.addClass("launcher-loading");
    console.log(vid);
}

function loadIframe(t) {
    t = $(t).closest(".launcher");
    var src = t.attr("data-src");
    var iframe = $('<iframe class="embed-responsive-item" seamless allowfullscreen frameborder="0" scrollable="no" allowTransparency="true" src="' + src + '"/><iframe>');
    t.after(iframe);
    t.remove();
    $("iframe:not([src])").remove();
}

function evaluateURL() {
    if (window.location.href.match(/\#[a-zA-Z0-9]+$/)) {
        var tag = window.location.href.replace(/.*\#([a-zA-Z0-9]+)/, "$1");
        if (tag.length == 24) {
            var pid = tag;
            if (active_post != pid) {
                console.log("show:" + pid);
                showpostviewer(pid);
                console.log("show");
            }
        } else {
            if (tag == "newpost") {
                shownewpost();
            }
        }
    } else {
        console.log("hideAll from evaluate");
        hideAll();
    }
}

(function(exports, global) {
    global["slideshow"] = exports;
    function init() {
        var slideshows = $(".slideshow");
        for (var i = 0; i < slideshows.length; i++) {
            $(slideshows.get(i)).find(".current").attr("src", slideshows.get(i).childNodes[0].dataset.src);
            $(slideshows.get(i)).attr("data-current", 0);
        }
    }
    function next(t) {
        var slideshow = $(t).closest(".slideshow");
        var n = parseInt(slideshow.attr("data-current"));
        n = n + 1;
        if (slideshow.find(".photo").length <= n) {
            n = 0;
        }
        slideshow.find(".current").attr("src", slideshow.get(0).childNodes[n].dataset.src);
        slideshow.attr("data-current", n);
    }
    function previous(t) {
        var slideshow = $(t).closest(".slideshow");
        var n = parseInt(slideshow.attr("data-current"));
        n = n - 1;
        if (n < 0) {
            n = slideshow.find(".photo").length - 1;
        }
        slideshow.find(".current").attr("src", slideshow.get(0).childNodes[n].dataset.src);
        slideshow.attr("data-current", n);
    }
    exports["init"] = init;
    exports["next"] = next;
    exports["previous"] = previous;
})({}, function() {
    return this;
}());

albumFiles = window.albumFiles = [];

URL = window.URL || window.webkitURL;

sending = 0;

active_post = 0;

loading_posts = false;

console.log(origin_url);

$(window).ready(function() {
    document.body.onload = function() {
        var loadingTime = new Date().getTime() - window.startLoading;
        console.log("loaded in " + loadingTime);
        $.ajax({
            url: "Ajax/post.php",
            type: "post",
            data: {
                action: "saveRecord",
                loadingTime: loadingTime,
                screenHeight: screen.height,
                screenWidth: screen.width
            },
            success: function(data) {
                console.log(data);
            },
            error: function() {
                console.log("fail record");
            }
        });
    };
    $(function() {
        FastClick.attach(document.body);
    });
    if ($("#info").attr("data-fid") != "") {
        $(document).on("scroll", function() {
            if (window.pageYOffset + window.innerHeight > document.body.scrollHeight - window.innerHeight / 2) {
                loadMorePosts();
            }
        });
    }
    window.onresize = function() {
        loadMorePosts();
    };
    window.ctrl = false;
    $(window).keydown(function(e) {
        if (e.keyCode != 17 && e.ctrlKey) {
            window.ctrl = true;
        } else {
            window.ctrl = false;
        }
    });
    retouche.start("#retoucheBox");
    setpostsviewable();
    if (typeof SC != "undefined") {
        SC.initialize({
            client_id: "01af1b3315ad8177aefecab596621e09"
        });
    }
    if ($("#info").length != 0) {
        evaluateURL();
        $(window).on("popstate", function() {
            evaluateURL();
        });
    }
    $(window).on("beforeunload", function(e) {
        if (window.sending > 0) {
            return "Upload en cours !";
        }
    });
    setInterval(function() {
        $(".nano").nanoScroller();
    }, 1e3);
    loadMorePosts();
});

(function(exports, global) {
    global["typebox"] = exports;
    var Control = {
        mergeEditableNodes: function(e) {
            for (i = 0; i < e.childNodes.length; i++) {
                if (e.childNodes[i].tagName == "DIV") {
                    if (e.childNodes[i - 1] != null && e.childNodes[i - 1].tagName == "DIV") {
                        e.childNodes[i - 1].innerHTML += "<br>" + e.childNodes[i].innerHTML;
                        e.removeChild(e.childNodes[i]);
                    }
                }
            }
        },
        searchFilter: function(e, filter, viewer, ending) {
            toProcess = [];
            for (i = 0; i < e.childNodes.length; i++) {
                node = e.childNodes[i];
                if (node.tagName == "DIV") {
                    toProcess.push(node);
                }
            }
            for (i = 0; i < toProcess.length; i++) {
                var output = [];
                output[0] = "";
                node = toProcess[i];
                inner = node.innerHTML;
                output = filter(inner, ending, viewer);
                if (output.length > 1 || output[0] != node.innerHTML) {
                    hasChanged = true;
                } else {
                    hasChanged = false;
                }
                if (hasChanged) {
                    var firstOutputElement = null;
                    var foeID = "";
                    if (output.length > 1) {
                        for (j = output.length - 1; j > 0; j--) {
                            node.insertAdjacentHTML("afterend", output[j]);
                            if (foeID == "") {
                                foeID = node.nextSibling.id;
                            }
                        }
                    }
                    if (output[0].match(/^\s*$/)) {
                        if (viewer) {
                            $(node).remove();
                        } else {
                            $(node).attr("data-placeholder", "").html("");
                        }
                    } else {
                        node.innerHTML = output[0];
                    }
                    if (!viewer && foeID != "") {
                        var tid = setInterval(function() {
                            var tmp = document.getElementById(foeID);
                            if (tmp.scrollHeight > 0) {
                                tmp.nextSibling.scrollIntoView(false);
                                clearInterval(tid);
                            }
                        }, 100);
                        setTimeout(function() {
                            clearInterval(tid);
                        }, 1e4);
                    }
                }
                if (viewer == null || viewer == false) {
                    Control.refocus(e);
                }
            }
            Control.refreshContent(viewer, e);
        },
        getCpos: function(element) {
            var caretOffset = 0;
            var doc = element.ownerDocument || element.document;
            var win = doc.defaultView || doc.parentWindow;
            var sel;
            if (typeof win.getSelection != "undefined") {
                sel = win.getSelection();
                if (sel.rangeCount > 0) {
                    var range = win.getSelection().getRangeAt(0);
                    var preCaretRange = range.cloneRange();
                    preCaretRange.selectNodeContents(element);
                    preCaretRange.setEnd(range.endContainer, range.endOffset);
                    caretOffset = preCaretRange.toString().length;
                }
            } else if ((sel = doc.selection) && sel.type != "Control") {
                var textRange = sel.createRange();
                var preCaretTextRange = doc.body.createTextRange();
                preCaretTextRange.moveToElementText(element);
                preCaretTextRange.setEndPoint("EndToEnd", textRange);
                caretOffset = preCaretTextRange.text.length;
            }
            var lignes = $(element).find("br").length;
            caretOffset = caretOffset + lignes;
            return caretOffset;
        },
        setCpos: function(e, c) {
            var placed = false;
            c = parseInt(c);
            if (c < 0) {
                c = 0;
            }
            count = 0;
            for (i = 0; i < e.childNodes.length; i++) {
                var node = e.childNodes[i];
                if (typeof node.tagName == "undefined") {
                    if (node.length >= c - count) {
                        var range = document.createRange();
                        range.setStart(node, c - count);
                        range.setEnd(node, c - count);
                        var sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(range);
                        placed = true;
                        break;
                    } else {
                        count = parseInt(count) + parseInt(node.length);
                    }
                } else {
                    if (c - count <= 1) {
                        $(node).after(document.createTextNode(" "));
                        var range = document.createRange();
                        range.setStartAfter(node);
                        range.setEndAfter(node);
                        var sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(range);
                        placed = true;
                        break;
                    } else {
                        count++;
                    }
                }
            }
            if (!placed) {
                node = e.childNodes[e.childNodes.length - 1];
                var range = document.createRange();
                range.setStart(node, node.length);
                range.setEnd(node, node.length);
                var sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            }
        },
        refreshContent: function(viewer, t) {
            t = $(t);
            if (viewer == null || viewer == false) {
                t.find("*[contenteditable]").off();
                t.find(".deletable").off();
                t.find("*[contenteditable]").on("dragover drop", function(event) {
                    event.preventDefault();
                    return false;
                });
                t.find(".deletable").on("mouseenter", function(event) {
                    $(event.currentTarget).append('<div onclick="$(this).closest(\'.deletable\').remove();" class="delete-btn"><i class="fa fa-times"></i></div>');
                });
                t.find(".deletable").on("mouseleave", function(event) {
                    $(event.currentTarget).children(".delete-btn").remove();
                });
            }
            t.find("iframe:not([src])").remove();
        },
        niceFocus: function(t) {
            if (!$(t).is("[contenteditable]")) {
                Control.refocus(t);
            } else {
                if ($(t).html() == "") {
                    t = t.parentNode;
                    Control.refocus(t);
                }
            }
        },
        refocus: function(t) {
            t = $(t);
            if (!t.children().last().is("div")) {
                t.append('<div contenteditable="true"> </div>');
                Control.refreshContent(t);
            }
            e = t.children().last()[0];
            e.focus();
            var range = document.createRange();
            range.selectNodeContents(e);
            range.collapse(false);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        },
        filter_out_ending: function(t, viewer) {
            Control.filter_out_search(t, viewer, true);
        },
        filter_out_search: function(t, viewer, ending) {
            Control.searchFilter(t, Filter.searchImgur, viewer, ending);
            Control.searchFilter(t, Filter.searchInstagram, viewer, ending);
            Control.searchFilter(t, Filter.searchOnedrive, viewer, ending);
            Control.searchFilter(t, Filter.searchGoogleDrive, viewer, ending);
            Control.searchFilter(t, Filter.searchSoundcloud, viewer, ending);
            Control.searchFilter(t, Filter.searchYoutube, viewer, ending);
            Control.searchFilter(t, Filter.searchYoutube2, viewer, ending);
            Control.searchFilter(t, Filter.searchVimeo, viewer, ending);
            Control.searchFilter(t, Filter.searchDailymotion, viewer, ending);
            Control.searchFilter(t, Filter.searchVine, viewer, ending);
            Control.searchFilter(t, Filter.searchImage, viewer, ending);
            Control.searchFilter(t, Filter.searchGif, viewer, ending);
            Control.searchFilter(t, Filter.searchVideo, viewer, ending);
            Control.searchFilter(t, Filter.searchLink, viewer, ending);
            Control.searchFilter(t, Filter.searchFile, viewer, ending);
        },
        filter_out_all: function(t, viewer) {
            Control.filter_out_ending(t, viewer);
            Control.filter_out_search(t, viewer);
        },
        searchMatch: function(args) {
            var callerName = args["callerName"];
            var inner = args["inner"];
            var regex = args["regex"];
            var substitution = args["substitution"];
            var callback = args["callback"];
            var fail = args["fail"];
            var ajax_url = args["ajax_url"];
            var ajax_var = args["ajax_var"];
            var ajax_method = args["ajax_method"];
            if (typeof ajax_method == "undefined") {
                ajax_method = "post";
            }
            inner = decode(inner);
            var output = [];
            var prem = inner.match(regex);
            m = [];
            xhrs = [];
            if (prem != null) {
                for (j = 0; j < prem.length; j++) {
                    m.push(prem[j].replace(/[\s]*/gi, ""));
                }
            }
            if (m.length > 0) {
                console.log(args);
                console.log("from inner:'" + inner + "'");
                console.log(m);
            }
            if (m.length != 0) {
                var str = inner;
                for (j = 0; j < m.length; j++) {
                    var pos = str.indexOf(m[j]);
                    var before = str.slice(0, pos);
                    if (before.match(/^\s+$/)) {
                        before = "";
                    }
                    if (j == 0) {
                        output.push(encode(before));
                    } else {
                        output.push('<div contenteditable="true">' + encode(before) + "</div>");
                    }
                    output.push(substitution(m[j]));
                    str = str.slice(pos + m[j].length);
                }
                if (!str.match(/^\s*$/)) {
                    output.push('<div contenteditable="true">' + encode(str) + "</div>");
                }
                for (j = 0; j < m.length; j++) {
                    settings = new Object();
                    var param = [];
                    if (typeof ajax_var != "undefined") {
                        param = ajax_var;
                    }
                    param["url"] = m[j];
                    if (typeof ajax_url != "undefined") {
                        settings.url = ajax_url;
                        settings.data = param;
                        settings.method = ajax_method;
                        console.log(settings);
                        if (callback != null) {
                            settings.success = function(data) {
                                callback(data);
                            };
                        } else {
                            settings.success = function(data) {
                                console.log(data);
                            };
                        }
                        if (fail != null) {
                            settings.error = function() {
                                fail(m[j]);
                            };
                        }
                        if (callback != null) {
                            $.ajax(settings);
                        }
                    }
                }
            } else {
                output[0] = encode(inner);
            }
            return output;
        }
    };
    var Filter = {
        searchImgur: function(inner, ending) {
            var baliseId = createId();
            var r1 = new RegExp(regex.imgur, "gi");
            if (!ending) {
                r1 = new RegExp(regex.imgur + "[s]", "gi");
            }
            substitution = function(str) {
                output = '<span class="deletable deletable-block" data-src="' + str + '" contenteditable="false" id="' + baliseId + '"><img src="Assets/ajax-loader.gif"/></span>';
                return output;
            };
            var ajax_url = "Ajax/post.php";
            var ajax_var = {
                action: "getImgur"
            };
            callback = function(data) {
                console.log(data);
                e = $(data["html"]);
                balise = $("#" + baliseId);
                balise.html(e);
            };
            fail = function(url) {
                console.log("fail");
                e = Filter.fail_request(url);
                balise = $("#" + baliseId);
                balise.html(e);
            };
            output = Control.searchMatch({
                callerName: "searchImgur",
                inner: inner,
                regex: r1,
                ajax_url: ajax_url,
                ajax_var: ajax_var,
                substitution: substitution,
                callback: callback,
                fail: fail
            });
            return output;
        },
        searchInstagram: function(inner, ending) {
            var baliseId = createId();
            var r1 = new RegExp(regex.instagram, "gi");
            if (!ending) {
                r1 = new RegExp(regex.instagram + "[s]", "gi");
            }
            substitution = function(str) {
                output = '<span class="deletable deletable-block" data-src="' + str + '" contenteditable="false" id="' + baliseId + '"><img src="Assets/ajax-loader.gif"/></span>';
                return output;
            };
            var ajax_url = "Ajax/post.php";
            var ajax_var = {
                action: "getInstagram"
            };
            callback = function(data) {
                console.log(data);
                e = $('<a class="mediaLink material-shadow" href="' + data["url"] + '" target="_blank"><i class="fa fa-instagram"></i></a><img class="zoomPossible" onclick="lightbox.enlighten(this)" onerror="error_im(this)" src="' + data["thumbnail_url"] + '"/>');
                balise = $("#" + baliseId);
                balise.html(e);
            };
            fail = function(url) {
                console.log("fail");
                e = Filter.fail_request(url);
                balise = $("#" + baliseId);
                balise.html(e);
            };
            output = Control.searchMatch({
                callerName: "searchInstagram",
                inner: inner,
                regex: r1,
                ajax_url: ajax_url,
                ajax_var: ajax_var,
                substitution: substitution,
                callback: callback,
                fail: fail
            });
            return output;
        },
        searchOnedrive: function(inner, ending) {
            var r1 = new RegExp(regex.onedrive, "gi");
            if (!ending) {
                r1 = new RegExp(regex.onedrive + "[s]", "gi");
            }
            substitution = function(str) {
                if (str.match(/resid=/)) {
                    var id = str.replace(/(https?:\/\/onedrive.live.com\/).*resid=([\!\%\w]+).*/, "$2");
                } else {
                    var id = str.replace(/(https?:\/\/onedrive.live.com\/).*id=([\!\%\w]+).*/, "$2");
                }
                console.log(id);
                if (id.match(/^[\!\%\w]+$/)) {
                    var b = '<span class="deletable deletable-block" data-src="' + str + '" contenteditable="false" id="' + str2md5(str) + '">';
                    var o = '<iframe width="320" height="180" seamless src="https://onedrive.live.com/embed?resid=' + id + '" frameborder="0"></iframe>';
                    var a = "</span>";
                    return b + o + a;
                } else {
                    return Filter.fail_request(str);
                }
            };
            output = Control.searchMatch({
                callerName: "searchOnedrive",
                inner: inner,
                regex: r1,
                substitution: substitution
            });
            return output;
        },
        searchGoogleDrive: function(inner, ending) {
            var r1 = new RegExp(regex.googleDrive, "gi");
            if (!ending) {
                r1 = new RegExp(regex.googleDrive + "[s]", "gi");
            }
            substitution = function(str) {
                if (str.match(/open\?id=/)) {
                    var id = str.replace(/(https?:\/\/drive.google.com\/open\?id=)(\w+)/, "$2");
                } else {
                    var id = str.replace(/(https?:\/\/drive.google.com\/file\/d\/)([\w]+)(\/)([^\s]+)/, "$2");
                }
                if (id.match(/^\w+$/)) {
                    var b = '<span class="deletable deletable-block" data-src="' + str + '" contenteditable="false" id="' + str2md5(str) + '">';
                    var o = '<div class="embed-responsive embed-responsive-square"><iframe seamless class="embed-responsive-item" src="https://drive.google.com/file/d/' + id + '/preview" frameborder="0"></iframe></div>';
                    var a = "</span>";
                    return b + o + a;
                } else {
                    return Filter.fail_request(str);
                }
            };
            output = Control.searchMatch({
                callerName: "searchGoogleDrive",
                inner: inner,
                regex: r1,
                substitution: substitution
            });
            return output;
        },
        searchSoundcloud: function(inner, ending) {
            var r1 = new RegExp(regex.soundcloud, "gi");
            if (!ending) {
                r1 = new RegExp(regex.soundcloud + "[s]", "gi");
            }
            substitution = function(str) {
                output = '<span class="deletable deletable-block" data-src="' + str + '" contenteditable="false" id="' + str2md5(str) + '"><img src="' + 'Assets/ajax-loader.gif"/></span>';
                setTimeout(function() {
                    SC.oEmbed(str, {
                        auto_play: true
                    }, function(oEmbed) {
                        song_url = oEmbed.html.replace(/.*src="([^"]+)".*/, "$1");
                        var w = song_url.replace(/auto_play=false/, "auto_play=true");
                        var xx = origin_url + "Data/miniature/" + str2md5(str) + ".jpg";
                        var o = '<span class="deletable deletable-block" data-src="' + str + '" contenteditable="false" id="' + str2md5(str) + '">';
                        o += '<div class="embed-responsive embed-responsive-16by9">';
                        o += '<div onclick="loadIframe(this)" data-src="' + w + '" class="launcher">';
                        o += '<img src="' + xx + '" onerror="loadIframe(this)"/>';
                        o += "</div></div></span>";
                        $("#" + str2md5(str)).html(o);
                    });
                }, 50);
                var b = '<span class="deletable deletable-block" data-src="' + str + '" contenteditable="false" id="' + str2md5(str) + '">';
                var o = str.replace(/(https?:\/\/vine.co\/v\/)([\w\-]+)/, '<div class="embed-responsive embed-responsive-square"><iframe seamless class="embed-responsive-item" src="$1$2/embed/simple" frameborder="0"></iframe></div><script async src="//platform.vine.co/static/scripts/embed.js" charset="utf-8"></script>');
                var a = "</span>";
                return b + o + a;
                return output;
            };
            output = Control.searchMatch({
                callerName: "searchSoundcloud",
                inner: inner,
                regex: r1,
                substitution: substitution
            });
            return output;
        },
        searchVine: function(inner, ending) {
            var r1 = new RegExp(regex.vine, "gi");
            if (!ending) {
                r1 = new RegExp(regex.vine + "[s]", "gi");
            }
            substitution = function(str) {
                var b = '<span class="deletable deletable-block" data-src="' + str + '" contenteditable="false" id="' + str2md5(str) + '">';
                var o = str.replace(/(https?:\/\/vine.co\/v\/)([\w\-]+)/, '<div class="embed-responsive embed-responsive-square"><iframe seamless class="embed-responsive-item" src="$1$2/embed/simple" frameborder="0"></iframe></div><script async src="//platform.vine.co/static/scripts/embed.js" charset="utf-8"></script>');
                var a = "</span>";
                return b + o + a;
            };
            output = Control.searchMatch({
                callerName: "searchVine",
                inner: inner,
                regex: r1,
                substitution: substitution
            });
            return output;
        },
        searchDailymotion: function(inner, ending) {
            var r1 = new RegExp(regex.dailymotion, "gi");
            if (!ending) {
                r1 = new RegExp(regex.dailymotion + "[s]", "gi");
            }
            substitution = function(str) {
                var w = str.replace(/(https?:\/\/www.dailymotion.com\/video\/)([\w\-]+)/, "http://www.dailymotion.com/embed/video/$2?autoplay=1");
                var xx = origin_url + "Data/miniature/" + str2md5(str) + ".jpg";
                var o = '<span class="deletable deletable-block" data-src="' + str + '" contenteditable="false" id="' + str2md5(str) + '">';
                o += '<div class="embed-responsive embed-responsive-16by9">';
                o += '<div onclick="loadIframe(this)" data-src="' + w + '" class="launcher">';
                o += '<img src="' + xx + '" onerror="loadIframe(this)"/>';
                o += "</div></div></span>";
                return o;
            };
            output = Control.searchMatch({
                callerName: "searchDailymotion",
                inner: inner,
                regex: r1,
                substitution: substitution
            });
            return output;
        },
        searchVimeo: function(inner, ending) {
            var r1 = new RegExp(regex.vimeo, "gi");
            if (!ending) {
                r1 = new RegExp(regex.vimeo + "[s]", "gi");
            }
            substitution = function(str) {
                var w = str.replace(/(https?:\/\/vimeo.com\/)(channels\/staffpicks\/)?([0-9]+)/, "http://player.vimeo.com/video/$3?autoplay=1");
                var xx = origin_url + "Data/miniature/" + str2md5(str) + ".jpg";
                var o = '<span class="deletable deletable-block" data-src="' + str + '" contenteditable="false" id="' + str2md5(str) + '">';
                o += '<div class="embed-responsive embed-responsive-16by9">';
                o += '<div onclick="loadIframe(this)" data-src="' + w + '" class="launcher">';
                o += '<img src="' + xx + '" onerror="loadIframe(this)"/>';
                o += "</div></div></span>";
                return o;
            };
            output = Control.searchMatch({
                callerName: "searchVimeo",
                inner: inner,
                regex: r1,
                substitution: substitution
            });
            return output;
        },
        searchYoutube2: function(inner, ending) {
            var r1 = new RegExp(regex.youtube2, "gi");
            if (!ending) {
                r1 = new RegExp(regex.youtube2 + "[s]", "gi");
            }
            substitution = function(str) {
                var v = str.replace(/(https?:\/\/youtu\.be\/)([\w\-]+)([^\s]*)/, "$2");
                var w = "http://www.youtube.com/embed/" + v + "?autoplay=1&controls=2&wmode=opaque";
                var xx = origin_url + "Data/miniature/" + str2md5(str) + ".jpg";
                var o = '<span class="deletable deletable-block" data-src="' + str + '" contenteditable="false" id="' + str2md5(str) + '">';
                o += '<div class="embed-responsive embed-responsive-16by9">';
                o += '<div onclick="loadIframe(this)" data-src="' + w + '" class="launcher">';
                o += '<img src="' + xx + '" onerror="loadIframe(this)"/>';
                o += "</div></div></span>";
                return o;
            };
            output = Control.searchMatch({
                callerName: "searchYoutube2",
                inner: inner,
                regex: r1,
                substitution: substitution
            });
            return output;
        },
        searchYoutube: function(inner, ending) {
            var r1 = new RegExp(regex.youtube, "gi");
            if (!ending) {
                r1 = new RegExp(regex.youtube + "[s]", "gi");
            }
            substitution = function(str) {
                var v = str.replace(/(https?:\/\/(www|m).youtube.com\/watch\?)([^\s]*)v=([\w\-]+)([^\s]*)/, "$4");
                var w = "http://www.youtube.com/embed/" + v + "?autoplay=1&controls=2&wmode=opaque";
                var xx = origin_url + "Data/miniature/" + str2md5(str) + ".jpg";
                var o = '<span class="deletable deletable-block" data-src="' + str + '" contenteditable="false" id="' + str2md5(str) + '">';
                o += '<div class="embed-responsive embed-responsive-16by9">';
                o += '<div onclick="loadIframe(this)" data-src="' + w + '" class="launcher">';
                o += '<img src="' + xx + '" onerror="loadIframe(this)"/>';
                o += "</div></div></span>";
                return o;
            };
            output = Control.searchMatch({
                callerName: "searchYoutube",
                inner: inner,
                regex: r1,
                substitution: substitution
            });
            return output;
        },
        searchVideo: function(inner, ending) {
            var r1 = new RegExp(regex.video, "gi");
            if (!ending) {
                r1 = new RegExp(regex.video + "[s]", "gi");
            }
            substitution = function(str) {
                var video_link = str;
                if (str.match(/\.gifv/)) {
                    video_link = str.replace(/\.gifv/, ".webm");
                }
                var xx = origin_url + "Data/miniature/" + str2md5(str) + ".jpg";
                var o = '<span class="deletable deletable-block" data-src="' + str + '" contenteditable="false" id="' + str2md5(str) + '">';
                o += '<div onclick="loadVideo(this)" data-src="' + video_link + '" class="launcher">';
                o += '<img src="' + xx + '" onerror="loadVideo(this)"/>';
                o += "</div></span>";
                return o;
            };
            output = Control.searchMatch({
                callerName: "searchVideo",
                inner: inner,
                regex: r1,
                substitution: substitution
            });
            return output;
        },
        searchImage: function(inner, ending) {
            var r1 = new RegExp(regex.image, "gi");
            if (!ending) {
                r1 = new RegExp(regex.image + "[s]", "gi");
            }
            substitution = function(str) {
                return '<span class="deletable deletable-block" data-src="' + str + '" contenteditable="false" id="' + str2md5(str) + '"><img class="zoomPossible" onclick="lightbox.enlighten(this)" onerror="error_im(this)" src="' + str + '"/></span>';
            };
            output = Control.searchMatch({
                callerName: "searchImage",
                inner: inner,
                regex: r1,
                substitution: substitution
            });
            return output;
        },
        searchGif: function(inner, ending) {
            var r1 = new RegExp(regex.gif, "gi");
            if (!ending) {
                r1 = new RegExp(regex.gif + "[s]", "gi");
            }
            substitution = function(str) {
                var xx = origin_url + "Data/miniature/" + str2md5(str) + ".jpg";
                var o = '<span class="deletable deletable-block" data-src="' + str + '" contenteditable="false" id="' + str2md5(str) + '">';
                o += '<div onclick="loadImage(this)" data-src="' + str + '" class="launcher">';
                o += '<img src="' + xx + '" onerror="loadImage(this)"/>';
                o += "</div></span>";
                return o;
            };
            output = Control.searchMatch({
                callerName: "searchImage",
                inner: inner,
                regex: r1,
                substitution: substitution
            });
            return output;
        },
        searchFile: function(inner, ending, viewer) {
            var r1 = new RegExp(regex.file, "gi");
            substitution = function(str) {
                output = '<span class="deletable deletable-block" data-src="' + str + '" contenteditable="false" id="' + str2md5(str.replace(/#.+$/, "")) + '"><img src="Assets/ajax-loader.gif"/></span>';
                return output;
            };
            var ajax_url = "Ajax/post.php";
            var ajax_var = {
                action: "getFile",
                viewer: viewer
            };
            callback = function(data) {
                console.log(data);
                console.log(data["html"]);
                balise = $("#" + str2md5(decodeURI(data["url"])));
                balise.html(data["html"]);
                console.log(viewer);
                if (viewer != false) {
                    $("img.lazyload").each(function() {
                        console.log(this.dataset.src);
                        this.src = this.dataset.src;
                        this.style.opacity = 1;
                    });
                }
            };
            fail = function(url) {
                balise = $("#" + str2md5(url));
                balise.html("error");
            };
            output = Control.searchMatch({
                callerName: "searchFile",
                inner: inner,
                regex: r1,
                substitution: substitution,
                ajax_url: ajax_url,
                ajax_var: ajax_var,
                callback: callback,
                fail: fail
            });
            return output;
        },
        fail_request: function(url) {
            e = $('<a class="b-link" href="' + url.replace(/\s/, " ") + '" target="_blank">' + url + "</a>");
            return e;
        },
        open_graph_build: function(data) {
            base_url = data["base_url"];
            var preview = "";
            if (typeof data["image"] != "undefined") {
                if (typeof data["image"]["url"] != "undefined" && !data["image"]["url"].match(/^\s*$/)) {
                    var xx = origin_url + "Data/miniature/" + str2md5(data["url"]) + ".jpg";
                    preview = '<div class="preview"><img src="' + xx + '" onerror="error_im(this)"/></div>';
                }
            }
            if (typeof data["title"] != "undefined" && data["title"] != "") {
                title = '<div class="title">' + html_entity_decode(data["title"]) + "</div>";
            } else {
                title = "";
            }
            if (typeof data["description"] != "undefined" && data["description"] != "") {
                description = '<div class="description">' + data["description"] + "</div>";
            } else {
                description = "";
            }
            if (preview != "" || title != "" && description != "") {
                e = $('<a class="article_big" href="' + decodeURI(data["url"]) + '" target="_blank">' + preview + title + description + '<div class="base_url">' + base_url + "</div></a>");
                if (typeof data["image"] != "undefined") {
                    if (data["image"]["url"] != "" && data["image"]["width"] != null && data["image"]["height"] != null && parseInt(data["image"]["width"]) < 380) {
                        e = $('<a class="article_small" href="' + decodeURI(data["url"]) + '" target="_blank">' + preview + title + description + '<div class="base_url">' + base_url + "</div></a>");
                    }
                }
            } else {
                e = Filter.fail_request(data["url"]);
            }
            return e;
        },
        searchLink: function(inner, ending) {
            var baliseId = createId();
            var r1 = new RegExp(regex.link, "gi");
            if (!ending) {
                r1 = new RegExp(regex.link + "[s]", "gi");
            }
            substitution = function(str) {
                output = '<span class="deletable deletable-block" data-src="' + str + '" contenteditable="false" id="' + baliseId + '"><img src="Assets/ajax-loader.gif"/></span>';
                return output;
            };
            var ajax_url = "Ajax/post.php";
            var ajax_var = {
                action: "gen_preview"
            };
            callback = function(data) {
                console.log(data);
                e = Filter.open_graph_build(data);
                balise = $('*[data-src="' + data["url"] + '"]');
                balise.html(e);
            };
            fail = function(url) {
                console.log("fail");
                e = Filter.fail_request(url);
                balise = $("#" + baliseId);
                balise.html(e);
            };
            output = Control.searchMatch({
                callerName: "searchLink",
                inner: inner,
                regex: r1,
                substitution: substitution,
                ajax_var: ajax_var,
                ajax_url: ajax_url,
                callback: callback,
                fail: fail
            });
            return output;
        }
    };
    function evaluate(id) {
        var t = $(id)[0];
        Control.filter_out_all(t);
    }
    function stop(id) {
        $(id).off();
    }
    function start(id) {
        var t = $(id)[0];
        var tt = $(id);
        tt.off();
        tt.on("paste", function(e) {
            e.preventDefault();
            e.stopPropagation();
            var text = "";
            var that = $(this);
            if (e.clipboardData) text = e.clipboardData.getData("text/plain"); else if (window.clipboardData) text = window.clipboardData.getData("Text"); else if (e.originalEvent.clipboardData) text = $("<div></div>").text(e.originalEvent.clipboardData.getData("text"));
            if (document.queryCommandSupported("insertText")) {
                document.execCommand("insertHTML", false, $(text).html());
                t = $(id)[0];
                Control.filter_out_all(t);
                return false;
            } else {
                that.find("*").each(function() {
                    $(this).addClass("within");
                });
                setTimeout(function() {
                    that.find("*").each(function() {
                        $(this).not(".within").contents().unwrap();
                    });
                }, 1);
            }
            return false;
        });
        tt.on("keydown", function(e) {
            if (e.keyCode === 13) {
                if (e.ctrlKey) {
                    tt.parent().find(".menu .send").click();
                } else {
                    cpos = Control.getCpos(document.activeElement);
                    console.log("cpos before :" + cpos);
                    if (e.target.innerHTML.trim().match(/\<br\>$/)) {
                        typebox.pasteHtmlAtCaret("<br>", false);
                    } else {
                        console.log(e.target.innerHTML.trim().match(/\<br\>$/));
                        console.log(e.target.innerHTML);
                        typebox.pasteHtmlAtCaret("<br>", false);
                        e.target.innerHTML = e.target.innerHTML + "<br>";
                    }
                    Control.setCpos(document.activeElement, parseInt(cpos + 1));
                    cpos = Control.getCpos(document.activeElement);
                    console.log("cpos after :" + cpos);
                    return false;
                }
            }
        });
        tt.on("keyup", function(e) {
            if (!e.ctrlKey && e.keyCode != 17 && !window.ctrl || e.keyCode == 86) {
                if ($(":focus").parent().is(id)) {
                    if (e.keyCode == 8 && $(":focus").html() == "") {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                    if (window.typed == null || window.typed != $(id).html()) {
                        if (e.target.textContent.match(/https?:\/\/[^\s]+/i) || e.target.textContent.match(/\{\:[A-Za-z0-9]+\:\}/i)) {
                            t = $(id)[0];
                            cpos = Control.getCpos(document.activeElement);
                            if (e.keyCode == 13) {
                                Control.filter_out_ending(t);
                            } else {
                                Control.filter_out_search(t);
                            }
                            if (cpos != false) {
                                if (e.keyCode == 13) {
                                    bias = 1;
                                } else {
                                    bias = 0;
                                }
                                bias = 0;
                                Control.setCpos(document.activeElement, parseInt(cpos + bias));
                            }
                            window.typed = $(id).html();
                        }
                    }
                }
            }
        });
        $(id).on("click", function(e) {
            if (e.currentTarget == e.target) {
                Control.niceFocus(e.currentTarget);
            }
        });
    }
    function view() {
        $(".post .dynamicBox").each(function() {
            Control.filter_out_all(this, true);
            $(this).find("*[contenteditable=true]").removeAttr("contenteditable");
            lazyload($(this).closest(".nano-content")[0]);
        });
    }
    function pasteHtmlAtCaret(html, selectPastedContent) {
        var sel, range;
        if (window.getSelection) {
            sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                range = sel.getRangeAt(0);
                range.deleteContents();
                var el = document.createElement("div");
                el.innerHTML = html;
                var frag = document.createDocumentFragment(), node, lastNode;
                while (node = el.firstChild) {
                    lastNode = frag.appendChild(node);
                }
                var firstNode = frag.firstChild;
                range.insertNode(frag);
                if (lastNode) {
                    range = range.cloneRange();
                    range.setStartAfter(lastNode);
                    if (selectPastedContent) {
                        range.setStartBefore(firstNode);
                    } else {
                        range.collapse(true);
                    }
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        } else if ((sel = document.selection) && sel.type != "Control") {
            var originalRange = sel.createRange();
            originalRange.collapse(true);
            sel.createRange().pasteHTML(html);
            if (selectPastedContent) {
                range = sel.createRange();
                range.setEndPoint("StartToStart", originalRange);
                range.select();
            }
        }
    }
    exports["Control"] = Control;
    exports["Filter"] = Filter;
    exports["evaluate"] = evaluate;
    exports["stop"] = stop;
    exports["start"] = start;
    exports["view"] = view;
    exports["pasteHtmlAtCaret"] = pasteHtmlAtCaret;
})({}, function() {
    return this;
}());

function hideAll() {
    hideslidefromleft("#mainmenu");
    hideimageeditor();
    hidepostviewer();
    hidenewpost();
    lightbox.darken();
}

function blockBody() {
    var locks = parseInt($("body").attr("data-locks"));
    if (!locks) {
        locks = 0;
    }
    var locks = locks + 1;
    $("body").attr("data-locks", locks);
    $("body").css({
        overflow: "hidden",
        "max-height": "100%"
    });
}

function unblockBody() {
    var locks = parseInt($("body").attr("data-locks"));
    if (!locks) {
        locks = 0;
    }
    var locks = locks - 1;
    if (locks < 1) {
        $("body").attr("data-locks", 0);
        $("body").css({
            overflow: "auto",
            "max-height": "none"
        });
    } else {
        $("body").attr("data-locks", locks);
    }
}

function toggleoptionsmenu(id) {
    g = $(id).find(".options-menu");
    if (!g.hasClass("active")) {
        g.css("display", "block");
        g.addClass("active");
        $(id).find("i").removeClass("fa-caret-down");
        $(id).find("i").addClass("fa-caret-up");
    } else {
        g.css("display", "none");
        g.removeClass("active");
        $(id).find("i").removeClass("fa-caret-up");
        $(id).find("i").addClass("fa-caret-down");
    }
}

function toggleslidefromleft(id) {
    g = $(id);
    if (!g.hasClass("active")) {
        showslidefromleft(id);
    } else {
        hideslidefromleft(id);
    }
}

function showslidefromleft(id) {
    hideAll();
    g = $(id);
    console.log(g);
    g.css({
        transform: "translateX(0)"
    });
    g.addClass("active");
    addMask("hideslidefromleft('" + id + "')", .75, 20);
}

function hideslidefromleft(id) {
    g = $(id);
    g.css({
        transform: "translateX(-100%)"
    });
    g.removeClass("active");
    removeMask();
}

function toggleslidefromright(id) {
    g = $(id);
    if (!g.hasClass("active")) {
        showslidefromright(id);
    } else {
        hideslidefromright(id);
    }
}

function showslidefromright(id) {
    hideAll();
    g = $(id);
    g.css({
        transform: "translateX(50%)",
        right: "50%"
    });
    g.addClass("active");
}

function hideslidefromright(id) {
    g = $(id);
    g.css({
        transform: "translateX(100%)",
        right: "0px"
    });
    g.removeClass("active");
}

function togglenewavatar() {
    pv = $("#newavatar");
    if (pv.hasClass("active")) {
        hideimageeditor();
    } else {
        showimageeditor("#retouchebox");
    }
}

function showimageeditor(id, t) {
    pv = $("#newavatar");
    pv.addClass("active");
    pv.css("display", "block");
    addMask("hideimageeditor()", .75, 699, "imageeditormask");
    if (t != null) {
        var img = $(t).parent().find("img");
        var src = img.attr("src");
        console.log(src);
        var fileId = $(t).closest(".deletable").attr("data-src").replace(/[{:}]/g, "");
        console.log(fileId);
        r = $("#retoucheBox");
        r.attr("data-action", "addImage");
        r.attr("data-arg", fileId);
        r.attr("data-w", img.attr("naturalWidth"));
        r.attr("data-h", img.attr("naturalHeight"));
        retouche.set(id, src);
    } else {
        retouche.restart("#retoucheBox");
    }
}

function hideimageeditor() {
    pv = $("#newavatar");
    pv.removeClass("active");
    pv.css("display", "none");
    $("#container").css("filter", "none");
    $("#container").css("-webkit-filter", "none");
    pv.html('<div id="retoucheBox"><div class="placeholder"><i class="label fa fa-photo"></i><span class="underLabel">Cliquez pour choisir une photo</span><input type="file"></input></div></div>');
    removeMask("imageeditormask");
}

function push_shownewpost() {
    window.history.replaceState("newpost", "", window.location.href.replace(/\#.*/, "") + "#newpost");
    evaluateURL();
}

function shownewpost() {
    e = $("#newpost");
    hideAll();
    showslidefromright("#slidenewpost");
    typebox.start("#typeBox");
    invite = $('<div contenteditable="true" data-placeholder="Partagez quelque chose..."></div>');
    $("#typeBox").html(invite);
    e.addClass("active");
    addMask("push_hidenewpost()", .75);
}

function push_hideAll() {
    window.history.pushState("", "", window.location.href.replace(/\#.*/, ""));
    evaluateURL();
}

function push_hidenewpost(sent) {
    window.history.replaceState("", "", window.location.href.replace(/\#.*/, ""));
    hidenewpost(sent);
}

function hidenewpost(sent) {
    if (sent) {
        var answer = true;
    } else {
        var nbc = document.getElementById("typeBox").childNodes.length;
        var fc = document.getElementById("typeBox").childNodes[0].innerHTML.replace(/\<br\>/, "");
        if (nbc == 1 && fc == "") {
            console.log("okay!");
            var answer = true;
        } else {
            console.log(fc);
            var answer = confirm("Voulez-vous vraiment annuler le message ?");
        }
    }
    if (answer == true) {
        e = $("#newpost");
        hideslidefromright("#slidenewpost");
        $("#newpost").removeClass("active");
        invite = $('<div contenteditable="true" data-placeholder="Partagez quelque chose..."></div>');
        $("#typeBox").html(invite);
        typebox.stop("#typeBox");
        removeMask();
    }
}

function hidenewcommentsection(id) {
    t = $(id);
    t.after('<div onclick="shownewcommentsection(this)" onfocus="shownewcommentsection(this)" class="new-comment-section" tabindex="1"><div class="fake-comment"><i class="fa fa-comment-o"></i>Ecrire un commentaire...</div></div>');
    t.remove();
}

function shownewcommentsection(id) {
    if (id == null) {
        id = $("#post-viewer .new-comment-section").get(0);
    }
    t = $(id);
    fc = t.children(":first-child");
    if (fc.hasClass("fake-comment")) {
        fc.remove();
        var cb = $('<div id="commentBox" class="dynamicBox"><div contenteditable="true" data-placeholder="Ecrire un commentaire..."></div></div>');
        var np_menu = $('<div class="menu"></div>');
        var np_cell1 = $('<div class="menu-cell"></div>');
        np_cell1.append('<button class="cancel" onclick="hidenewcommentsection($(\'.new-comment-section\'))">Annuler</button>');
        var np_cell2 = $('<div class="menu-cell"></div>');
        np_cell2.append('<button onclick="inputFile(\'#commentBox\')" class="action"><i class="fa fa-paperclip"></i></button>');
        var np_cell3 = $('<div class="menu-cell"></div>');
        np_cell3.append('<button class="send" onclick="sendIt(\'#commentBox\')">Envoyer</button>');
        np_menu.append(np_cell1);
        np_menu.append(np_cell2);
        np_menu.append(np_cell3);
        t.append(cb).append(np_menu);
        typebox.start("#commentBox");
        typebox.Control.niceFocus("#commentBox");
    }
}

function push_showpost(id) {
    window.history.pushState("{pid:" + id + "}", "", window.location.href.replace(/\#.*/, "") + "#" + id);
    evaluateURL();
}

function showpostviewer(id) {
    hideAll();
    showslidefromright("#slidepostviewer");
    spv = $("#slidepostviewer");
    spv.addClass("active");
    spv.append('<div class="nano"><div class="nano-content"></div></div>');
    $("#slidepostviewer .nano .nano-content").append('<div id="post-viewer" tabindex="-1"></div>');
    addMask("push_hideAll()", .75);
    $("#post-viewer").attr("data-id", id);
    $("#post-viewer").append('<div class="spinner"><div class="bg-white bounce1"></div><div class="bg-white bounce2"></div><div class="bg-white bounce3"></div></div>');
    console.log("show: " + id);
    console.log("Ajax/get.php?action=getPost&id=" + id);
    active_post = id;
    $.ajax({
        url: "Ajax/get.php",
        type: "GET",
        data: {
            action: "getPost",
            id: id
        },
        success: function(data) {
            console.log(data);
            if (data == null || data == "") {
                push_hideAll();
            } else {
                recordUsage("post");
                $("#post-viewer .spinner").remove();
                $("#mask").addClass("dark-mask");
                var plop = $(data["html"]);
                $("#post-viewer").append(plop);
                $("#post-viewer").append('<div onclick="shownewcommentsection(this)" onfocus="shownewcommentsection(this)" class="new-comment-section" tabindex="1"><div class="fake-comment"><i class="fa fa-comment-o"></i>Ecrire un commentaire...</div></div>');
                updatePostStats(id);
                lazyload($(".nano-content")[0]);
                $(".nano-content").on("scroll", function(e) {
                    lazyload(e.currentTarget);
                });
                $("#post-viewer").focus();
            }
        },
        error: function() {
            console.log("fail load post");
        }
    });
}

function hidepostviewer() {
    unblockBody();
    hideslidefromright("#slidepostviewer");
    var spv = $("#slidepostviewer");
    spv.html("");
    spv.off();
    removeMask();
    typebox.stop("#commentBox");
    active_post = 0;
}

function addMask(func, darkness, zindex, id) {
    if (id == null) {
        id = "mask";
    }
    mask = $('<div class="mask" id="' + id + '" onclick="' + func + '"></div>');
    $("body").append(mask);
    blockBody();
    $("#" + id).css("background", "rgba(0,0,0," + darkness + ")");
    if (zindex != null) {
        $("#" + id).css("z-index", zindex);
    }
}

function removeMask(id) {
    if (id == null) {
        id = "mask";
    }
    $("#" + id).remove();
    unblockBody();
}

function lazyload(e) {
    $(e).find("img.lazyload:not([src])").each(function() {
        var y = e.scrollTop + window.screen.height;
        var node = this;
        var yy = node.offsetTop - 10;
        while (!node.parentNode.className.match(/\.nano-content/) && node.parentNode != document.body) {
            node = node.parentNode;
            yy += node.offsetTop;
        }
        if (yy < y) {
            unveil(this);
        }
    });
}

function unveil(e) {
    if (e.src == "") {
        console.log("load :" + e.dataset.src);
        e.src = e.dataset.src;
        e.onload = function() {
            e.style.opacity = 1;
            e.removeAttribute("width");
            e.removeAttribute("height");
        };
    }
}

function fakeComment() {
    var uid = $("#info").attr("data-uid");
    $.ajax({
        url: "Ajax/post.php",
        type: "post",
        data: {
            action: "recordUsage",
            usage: usage
        },
        success: function(data) {
            console.log(data);
        },
        error: function() {
            console.log("fail record");
        }
    });
    var fc = $('<div onclick="shownewcommentsection(this)" onfocus="shownewcommentsection(this)" class="new-comment-section" tabindex="1"><div class="fake-comment"><i class="fa fa-comment-o"></i>Ecrire un commentaire...</div></div>');
}

function error_im(t) {
    t.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
}

function utf8_encode(argString) {
    if (argString === null || typeof argString === "undefined") {
        return "";
    }
    var string = argString + "";
    var utftext = "", start, end, stringl = 0;
    start = end = 0;
    stringl = string.length;
    for (var n = 0; n < stringl; n++) {
        var c1 = string.charCodeAt(n);
        var enc = null;
        if (c1 < 128) {
            end++;
        } else if (c1 > 127 && c1 < 2048) {
            enc = String.fromCharCode(c1 >> 6 | 192, c1 & 63 | 128);
        } else if ((c1 & 63488) != 55296) {
            enc = String.fromCharCode(c1 >> 12 | 224, c1 >> 6 & 63 | 128, c1 & 63 | 128);
        } else {
            if ((c1 & 64512) != 55296) {
                throw new RangeError("Unmatched trail surrogate at " + n);
            }
            var c2 = string.charCodeAt(++n);
            if ((c2 & 64512) != 56320) {
                throw new RangeError("Unmatched lead surrogate at " + (n - 1));
            }
            c1 = ((c1 & 1023) << 10) + (c2 & 1023) + 65536;
            enc = String.fromCharCode(c1 >> 18 | 240, c1 >> 12 & 63 | 128, c1 >> 6 & 63 | 128, c1 & 63 | 128);
        }
        if (enc !== null) {
            if (end > start) {
                utftext += string.slice(start, end);
            }
            utftext += enc;
            start = end = n + 1;
        }
    }
    if (end > start) {
        utftext += string.slice(start, stringl);
    }
    return utftext;
}

function str2md5(str) {
    var xl;
    var rotateLeft = function(lValue, iShiftBits) {
        return lValue << iShiftBits | lValue >>> 32 - iShiftBits;
    };
    var addUnsigned = function(lX, lY) {
        var lX4, lY4, lX8, lY8, lResult;
        lX8 = lX & 2147483648;
        lY8 = lY & 2147483648;
        lX4 = lX & 1073741824;
        lY4 = lY & 1073741824;
        lResult = (lX & 1073741823) + (lY & 1073741823);
        if (lX4 & lY4) {
            return lResult ^ 2147483648 ^ lX8 ^ lY8;
        }
        if (lX4 | lY4) {
            if (lResult & 1073741824) {
                return lResult ^ 3221225472 ^ lX8 ^ lY8;
            } else {
                return lResult ^ 1073741824 ^ lX8 ^ lY8;
            }
        } else {
            return lResult ^ lX8 ^ lY8;
        }
    };
    var _F = function(x, y, z) {
        return x & y | ~x & z;
    };
    var _G = function(x, y, z) {
        return x & z | y & ~z;
    };
    var _H = function(x, y, z) {
        return x ^ y ^ z;
    };
    var _I = function(x, y, z) {
        return y ^ (x | ~z);
    };
    var _FF = function(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_F(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };
    var _GG = function(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_G(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };
    var _HH = function(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_H(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };
    var _II = function(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_I(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };
    var convertToWordArray = function(str) {
        var lWordCount;
        var lMessageLength = str.length;
        var lNumberOfWords_temp1 = lMessageLength + 8;
        var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - lNumberOfWords_temp1 % 64) / 64;
        var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
        var lWordArray = new Array(lNumberOfWords - 1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - lByteCount % 4) / 4;
            lBytePosition = lByteCount % 4 * 8;
            lWordArray[lWordCount] = lWordArray[lWordCount] | str.charCodeAt(lByteCount) << lBytePosition;
            lByteCount++;
        }
        lWordCount = (lByteCount - lByteCount % 4) / 4;
        lBytePosition = lByteCount % 4 * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | 128 << lBytePosition;
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
        return lWordArray;
    };
    var wordToHex = function(lValue) {
        var wordToHexValue = "", wordToHexValue_temp = "", lByte, lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = lValue >>> lCount * 8 & 255;
            wordToHexValue_temp = "0" + lByte.toString(16);
            wordToHexValue = wordToHexValue + wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
        }
        return wordToHexValue;
    };
    var x = [], k, AA, BB, CC, DD, a, b, c, d, S11 = 7, S12 = 12, S13 = 17, S14 = 22, S21 = 5, S22 = 9, S23 = 14, S24 = 20, S31 = 4, S32 = 11, S33 = 16, S34 = 23, S41 = 6, S42 = 10, S43 = 15, S44 = 21;
    str = this.utf8_encode(str);
    x = convertToWordArray(str);
    a = 1732584193;
    b = 4023233417;
    c = 2562383102;
    d = 271733878;
    xl = x.length;
    for (k = 0; k < xl; k += 16) {
        AA = a;
        BB = b;
        CC = c;
        DD = d;
        a = _FF(a, b, c, d, x[k + 0], S11, 3614090360);
        d = _FF(d, a, b, c, x[k + 1], S12, 3905402710);
        c = _FF(c, d, a, b, x[k + 2], S13, 606105819);
        b = _FF(b, c, d, a, x[k + 3], S14, 3250441966);
        a = _FF(a, b, c, d, x[k + 4], S11, 4118548399);
        d = _FF(d, a, b, c, x[k + 5], S12, 1200080426);
        c = _FF(c, d, a, b, x[k + 6], S13, 2821735955);
        b = _FF(b, c, d, a, x[k + 7], S14, 4249261313);
        a = _FF(a, b, c, d, x[k + 8], S11, 1770035416);
        d = _FF(d, a, b, c, x[k + 9], S12, 2336552879);
        c = _FF(c, d, a, b, x[k + 10], S13, 4294925233);
        b = _FF(b, c, d, a, x[k + 11], S14, 2304563134);
        a = _FF(a, b, c, d, x[k + 12], S11, 1804603682);
        d = _FF(d, a, b, c, x[k + 13], S12, 4254626195);
        c = _FF(c, d, a, b, x[k + 14], S13, 2792965006);
        b = _FF(b, c, d, a, x[k + 15], S14, 1236535329);
        a = _GG(a, b, c, d, x[k + 1], S21, 4129170786);
        d = _GG(d, a, b, c, x[k + 6], S22, 3225465664);
        c = _GG(c, d, a, b, x[k + 11], S23, 643717713);
        b = _GG(b, c, d, a, x[k + 0], S24, 3921069994);
        a = _GG(a, b, c, d, x[k + 5], S21, 3593408605);
        d = _GG(d, a, b, c, x[k + 10], S22, 38016083);
        c = _GG(c, d, a, b, x[k + 15], S23, 3634488961);
        b = _GG(b, c, d, a, x[k + 4], S24, 3889429448);
        a = _GG(a, b, c, d, x[k + 9], S21, 568446438);
        d = _GG(d, a, b, c, x[k + 14], S22, 3275163606);
        c = _GG(c, d, a, b, x[k + 3], S23, 4107603335);
        b = _GG(b, c, d, a, x[k + 8], S24, 1163531501);
        a = _GG(a, b, c, d, x[k + 13], S21, 2850285829);
        d = _GG(d, a, b, c, x[k + 2], S22, 4243563512);
        c = _GG(c, d, a, b, x[k + 7], S23, 1735328473);
        b = _GG(b, c, d, a, x[k + 12], S24, 2368359562);
        a = _HH(a, b, c, d, x[k + 5], S31, 4294588738);
        d = _HH(d, a, b, c, x[k + 8], S32, 2272392833);
        c = _HH(c, d, a, b, x[k + 11], S33, 1839030562);
        b = _HH(b, c, d, a, x[k + 14], S34, 4259657740);
        a = _HH(a, b, c, d, x[k + 1], S31, 2763975236);
        d = _HH(d, a, b, c, x[k + 4], S32, 1272893353);
        c = _HH(c, d, a, b, x[k + 7], S33, 4139469664);
        b = _HH(b, c, d, a, x[k + 10], S34, 3200236656);
        a = _HH(a, b, c, d, x[k + 13], S31, 681279174);
        d = _HH(d, a, b, c, x[k + 0], S32, 3936430074);
        c = _HH(c, d, a, b, x[k + 3], S33, 3572445317);
        b = _HH(b, c, d, a, x[k + 6], S34, 76029189);
        a = _HH(a, b, c, d, x[k + 9], S31, 3654602809);
        d = _HH(d, a, b, c, x[k + 12], S32, 3873151461);
        c = _HH(c, d, a, b, x[k + 15], S33, 530742520);
        b = _HH(b, c, d, a, x[k + 2], S34, 3299628645);
        a = _II(a, b, c, d, x[k + 0], S41, 4096336452);
        d = _II(d, a, b, c, x[k + 7], S42, 1126891415);
        c = _II(c, d, a, b, x[k + 14], S43, 2878612391);
        b = _II(b, c, d, a, x[k + 5], S44, 4237533241);
        a = _II(a, b, c, d, x[k + 12], S41, 1700485571);
        d = _II(d, a, b, c, x[k + 3], S42, 2399980690);
        c = _II(c, d, a, b, x[k + 10], S43, 4293915773);
        b = _II(b, c, d, a, x[k + 1], S44, 2240044497);
        a = _II(a, b, c, d, x[k + 8], S41, 1873313359);
        d = _II(d, a, b, c, x[k + 15], S42, 4264355552);
        c = _II(c, d, a, b, x[k + 6], S43, 2734768916);
        b = _II(b, c, d, a, x[k + 13], S44, 1309151649);
        a = _II(a, b, c, d, x[k + 4], S41, 4149444226);
        d = _II(d, a, b, c, x[k + 11], S42, 3174756917);
        c = _II(c, d, a, b, x[k + 2], S43, 718787259);
        b = _II(b, c, d, a, x[k + 9], S44, 3951481745);
        a = addUnsigned(a, AA);
        b = addUnsigned(b, BB);
        c = addUnsigned(c, CC);
        d = addUnsigned(d, DD);
    }
    var temp = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
    return temp.toLowerCase();
}

function htmlentities(string, quote_style, charset, double_encode) {
    var hash_map = this.get_html_translation_table("HTML_ENTITIES", quote_style), symbol = "";
    string = string == null ? "" : string + "";
    if (!hash_map) {
        return false;
    }
    if (quote_style && quote_style === "ENT_QUOTES") {
        hash_map["'"] = "&#039;";
    }
    if (!!double_encode || double_encode == null) {
        for (symbol in hash_map) {
            if (hash_map.hasOwnProperty(symbol)) {
                string = string.split(symbol).join(hash_map[symbol]);
            }
        }
    } else {
        string = string.replace(/([\s\S]*?)(&(?:#\d+|#x[\da-f]+|[a-zA-Z][\da-z]*);|$)/g, function(ignore, text, entity) {
            for (symbol in hash_map) {
                if (hash_map.hasOwnProperty(symbol)) {
                    text = text.split(symbol).join(hash_map[symbol]);
                }
            }
            return text + entity;
        });
    }
    return string;
}

function html_entity_decode(string, quote_style) {
    var hash_map = {}, symbol = "", tmp_str = "", entity = "";
    tmp_str = string.toString();
    if (false === (hash_map = this.get_html_translation_table("HTML_ENTITIES", quote_style))) {
        return false;
    }
    delete hash_map["&"];
    hash_map["&"] = "&amp;";
    for (symbol in hash_map) {
        entity = hash_map[symbol];
        tmp_str = tmp_str.split(entity).join(symbol);
    }
    tmp_str = tmp_str.split("&#039;").join("'");
    return tmp_str;
}

function get_html_translation_table(table, quote_style) {
    var entities = {}, hash_map = {}, decimal;
    var constMappingTable = {}, constMappingQuoteStyle = {};
    var useTable = {}, useQuoteStyle = {};
    constMappingTable[0] = "HTML_SPECIALCHARS";
    constMappingTable[1] = "HTML_ENTITIES";
    constMappingQuoteStyle[0] = "ENT_NOQUOTES";
    constMappingQuoteStyle[2] = "ENT_COMPAT";
    constMappingQuoteStyle[3] = "ENT_QUOTES";
    useTable = !isNaN(table) ? constMappingTable[table] : table ? table.toUpperCase() : "HTML_SPECIALCHARS";
    useQuoteStyle = !isNaN(quote_style) ? constMappingQuoteStyle[quote_style] : quote_style ? quote_style.toUpperCase() : "ENT_COMPAT";
    if (useTable !== "HTML_SPECIALCHARS" && useTable !== "HTML_ENTITIES") {
        throw new Error("Table: " + useTable + " not supported");
    }
    entities["38"] = "&amp;";
    if (useTable === "HTML_ENTITIES") {
        entities["160"] = "&nbsp;";
        entities["161"] = "&iexcl;";
        entities["162"] = "&cent;";
        entities["163"] = "&pound;";
        entities["164"] = "&curren;";
        entities["165"] = "&yen;";
        entities["166"] = "&brvbar;";
        entities["167"] = "&sect;";
        entities["168"] = "&uml;";
        entities["169"] = "&copy;";
        entities["170"] = "&ordf;";
        entities["171"] = "&laquo;";
        entities["172"] = "&not;";
        entities["173"] = "&shy;";
        entities["174"] = "&reg;";
        entities["175"] = "&macr;";
        entities["176"] = "&deg;";
        entities["177"] = "&plusmn;";
        entities["178"] = "&sup2;";
        entities["179"] = "&sup3;";
        entities["180"] = "&acute;";
        entities["181"] = "&micro;";
        entities["182"] = "&para;";
        entities["183"] = "&middot;";
        entities["184"] = "&cedil;";
        entities["185"] = "&sup1;";
        entities["186"] = "&ordm;";
        entities["187"] = "&raquo;";
        entities["188"] = "&frac14;";
        entities["189"] = "&frac12;";
        entities["190"] = "&frac34;";
        entities["191"] = "&iquest;";
        entities["192"] = "&Agrave;";
        entities["193"] = "&Aacute;";
        entities["194"] = "&Acirc;";
        entities["195"] = "&Atilde;";
        entities["196"] = "&Auml;";
        entities["197"] = "&Aring;";
        entities["198"] = "&AElig;";
        entities["199"] = "&Ccedil;";
        entities["200"] = "&Egrave;";
        entities["201"] = "&Eacute;";
        entities["202"] = "&Ecirc;";
        entities["203"] = "&Euml;";
        entities["204"] = "&Igrave;";
        entities["205"] = "&Iacute;";
        entities["206"] = "&Icirc;";
        entities["207"] = "&Iuml;";
        entities["208"] = "&ETH;";
        entities["209"] = "&Ntilde;";
        entities["210"] = "&Ograve;";
        entities["211"] = "&Oacute;";
        entities["212"] = "&Ocirc;";
        entities["213"] = "&Otilde;";
        entities["214"] = "&Ouml;";
        entities["215"] = "&times;";
        entities["216"] = "&Oslash;";
        entities["217"] = "&Ugrave;";
        entities["218"] = "&Uacute;";
        entities["219"] = "&Ucirc;";
        entities["220"] = "&Uuml;";
        entities["221"] = "&Yacute;";
        entities["222"] = "&THORN;";
        entities["223"] = "&szlig;";
        entities["224"] = "&agrave;";
        entities["225"] = "&aacute;";
        entities["226"] = "&acirc;";
        entities["227"] = "&atilde;";
        entities["228"] = "&auml;";
        entities["229"] = "&aring;";
        entities["230"] = "&aelig;";
        entities["231"] = "&ccedil;";
        entities["232"] = "&egrave;";
        entities["233"] = "&eacute;";
        entities["234"] = "&ecirc;";
        entities["235"] = "&euml;";
        entities["236"] = "&igrave;";
        entities["237"] = "&iacute;";
        entities["238"] = "&icirc;";
        entities["239"] = "&iuml;";
        entities["240"] = "&eth;";
        entities["241"] = "&ntilde;";
        entities["242"] = "&ograve;";
        entities["243"] = "&oacute;";
        entities["244"] = "&ocirc;";
        entities["245"] = "&otilde;";
        entities["246"] = "&ouml;";
        entities["247"] = "&divide;";
        entities["248"] = "&oslash;";
        entities["249"] = "&ugrave;";
        entities["250"] = "&uacute;";
        entities["251"] = "&ucirc;";
        entities["252"] = "&uuml;";
        entities["253"] = "&yacute;";
        entities["254"] = "&thorn;";
        entities["255"] = "&yuml;";
    }
    if (useQuoteStyle !== "ENT_NOQUOTES") {
        entities["34"] = "&quot;";
    }
    if (useQuoteStyle === "ENT_QUOTES") {
        entities["39"] = "&#39;";
    }
    entities["60"] = "&lt;";
    entities["62"] = "&gt;";
    for (decimal in entities) {
        if (entities.hasOwnProperty(decimal)) {
            hash_map[String.fromCharCode(decimal)] = entities[decimal];
        }
    }
    return hash_map;
}

function br2nl(input) {
    return input.replace(/<br\s*\/?>/gi, "\n");
}

function nl2br(input) {
    return input.replace(/\n|\r|\n\r|\r\n/g, "<br>");
}

function decode(input) {
    return br2nl(html_entity_decode(input, "ENT_NOQUOTES"));
}

function encode(input) {
    return nl2br(htmlentities(input, "ENT_NOQUOTES"));
}

function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(",")[1]);
    var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ ia ], {
        type: mimeString
    });
}

String.prototype.hashCode = function() {
    var hash = 0, i, chr, len;
    if (this.length === 0) return hash;
    for (i = 0, len = this.length; i < len; i++) {
        chr = this.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0;
    }
    return hash;
};

function createId() {
    var dateId = Date.now().toString(36);
    var randomId = Math.random().toString(36).slice(2);
    var htmlId = document.documentElement.innerHTML.hashCode().toString(36).slice(1);
    return dateId + randomId + htmlId;
}
