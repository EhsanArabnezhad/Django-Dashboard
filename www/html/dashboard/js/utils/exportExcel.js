
var orbUtil = require('./orb.util.js')


var exportToExcel = function(tableHTML){

    // TODO: see also http://jsfiddle.net/cmewv/1113/

    var contentType = 'data:application/vnd.ms-excel;base64,'
    var header = '<html lang="en-US" xml:lang="en-US" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">' +
     	'<head>' +
     	'<meta http-equiv=Content-Type content="text/html; charset=UTF-8">' +
     	'<!--[if gte mso 9]><xml>' +
     	' <x:ExcelWorkbook>' +
     	'  <x:ExcelWorksheets>' +
     	'   <x:ExcelWorksheet>' +
     	'    <x:Name>###sheetname###</x:Name>' +
     	'    <x:WorksheetOptions>' +
     	'     <x:ProtectContents>False</x:ProtectContents>' +
     	'     <x:ProtectObjects>False</x:ProtectObjects>' +
     	'     <x:ProtectScenarios>False</x:ProtectScenarios>' +
     	'    </x:WorksheetOptions>' +
     	'   </x:ExcelWorksheet>' +
     	'  </x:ExcelWorksheets>' +
     	'  <x:ProtectStructure>False</x:ProtectStructure>' +
     	'  <x:ProtectWindows>False</x:ProtectWindows>' +
     	' </x:ExcelWorkbook>' +
     	'</xml><![endif]-->' +
     	'</head>' +
     	'<body>'

    var footer = '</body></html>'

    var xlsDocument = header + tableHTML + footer
    xlsDocument = orbUtil.btoa(unescape(encodeURIComponent(xlsDocument)))

    var downloadLink = document.createElement('a')
    downloadLink.href = contentType + xlsDocument
    downloadLink.download = 'table.xls'

    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
}

module.exports = exportToExcel
