// $('.nav-projects').css({"text-decoration":"underline"})



$(document).ready(function () {
    $('.nav-projects').addClass('nav-select');

    
    $(".nav").on('mouseenter', function(){ 
        $(".nav").removeClass('nav-select');
        $(this).addClass('nav-select'); })
    $(".nav").on('mouseleave', function(){ 
        $(this).removeClass('nav-select'); })

    $(".header").on('mouseleave', function(){ 
        var url = window.location.href;
        var page = url.match(/[^/\\&\?]+\.\w{3,4}(?=([\?&].*$|$))/gi)
        // $(".nav").removeClass('nav-select');
        if(page == "index.html"){
            $(".nav-projects").addClass('nav-select');
        } else if(page == "writing.html"){
            $(".nav-writing").addClass('nav-select');
        } else if (page == "art.html") {
            $(".nav-art").addClass('nav-select');
        } else {
            $(".nav-about").addClass('nav-select');
        }

        $(this).removeClass('nav-select'); 
    })
});