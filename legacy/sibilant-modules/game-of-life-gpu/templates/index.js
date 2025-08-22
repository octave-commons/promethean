var portfolioPiece = (function portfolioPiece$(name) {
    /* portfolio-piece eval.sibilant:9:0 */

    return create(HtmlElement)("article", {}, [create(HtmlElement)("iframe", {
        'height': 256,
        'width': 256,
        'src': ("./" + name + ".html"),
        'style': "display:block;"
    }, []), create(HtmlElement)("section", {
        'style': "text-align:center;width:256px"
    }, [create(HtmlElement)("a", {
        'href': ("/html/" + name + ".html")
    }, [name.replace((new RegExp("-", "g")), " ")])])]);
});
create(HtmlElement)("html", {}, [create(HtmlElement)("head", {}, [create(HtmlElement)("title", {}, ["Welcome to the Error Log"]), create(HtmlElement)("script", {
    'src': "/js/bundle.js"
}, []), create(HtmlElement)("script", {}, [(function() {
    /* eval.sibilant:15:46 */


}).call(this)])]), create(HtmlElement)("body", {}, [create(HtmlElement)("header", {
    'style': "text-align:center;"
}, [create(HtmlElement)("h1", {}, ["Error log"])]), create(HtmlElement)("section", {
    'style': "display:flex;flex-wrap:wrap;margin:auto;width:80%;"
}, [portfolioPiece("game-of-life"), portfolioPiece("side-scroller"), portfolioPiece("simple-sun"), portfolioPiece("toroidal-coordinates")])])]);