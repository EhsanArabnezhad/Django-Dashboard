
//var canvg = require('canvg')

var exportToPNG = function(SVG){

    var canvas = document.createElement('canvas')
    document.body.appendChild(canvas)

    canvg(canvas, SVG, {
        // TODO: see docs, can't get it right at the moment
        /*ignoreDimensions: false,
        scaleWidth: canvas.width*5,
        scaleHeight: canvas.height*5*/
    })

    var ctx = canvas.getContext('2d')
    var compositeOperation = ctx.globalCompositeOperation
	ctx.globalCompositeOperation = "destination-over"
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    //ctx.scale(10,10)

    var canvasPNG = canvas.toDataURL('image/png', 1.0)
    //window.open(canvasPNG)

    var downloadLink = document.createElement('a')
    downloadLink.href = canvasPNG
    downloadLink.download = 'plot.png'

    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
    document.body.removeChild(canvas)
}

module.exports = exportToPNG
