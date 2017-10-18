// ==UserScript==
// @name         Chart.js
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.baidu.com/?chart=1
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_listValues
// @grant GM_log
// @grant GM_deleteValue
// @require    http://libs.baidu.com/jquery/1.9.0/jquery.min.js
// @require    http://apps.bdimg.com/libs/Chart.js/0.2.0/Chart.min.js
// @require    https://img.hcharts.cn/highcharts/highcharts.js
// ==/UserScript==

//---------------------
$(document).ready(function(){
    sHtmlH = '<div id="highcharts" width="800" height="600"></div>';
    $('body').prepend(sHtmlH);

    var mydata = {
    	0:{"pkey":"a","updated":"2017-10-18","amount":"1"},
    	1:{"pkey":"a","updated":"2017-10-17","amount":"2"},
    	2:{"pkey":"a","updated":"2017-10-16","amount":"3"},
    	3:{"pkey":"b","updated":"2017-10-18","amount":"1"},
    	4:{"pkey":"b","updated":"2017-10-17","amount":"2"},
    	5:{"pkey":"b","updated":"2017-10-16","amount":"1"},
    	6:{"pkey":"c","updated":"2017-10-18","amount":"4"},
    	7:{"pkey":"c","updated":"2017-10-17","amount":"5"}
    }


    var mydataClassed = {};
    for (var key in mydata) {
    	var tmp = {};
    	tmp[mydata[key]['updated'] = mydata[key]['amount']
    	mydataClassed[mydata[key]['pkey']] = tmp;
    }

    console.log(mydataClassed);


    var max = 0
    for (var key in mydataClassed) {
    	var length = mydataClassed[key].length;
    	if (length > max) {
    		max = length;
    	}
    }




    $('#highcharts').highcharts({
        chart: {
            type: 'line'
        },
        title: {
            text: '月平均气温'
        },
        subtitle: {
            text: '数据来源: WorldClimate.com'
        },
        xAxis: {
            categories: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
        },
        yAxis: {
            title: {
                text: '气温 (°C)'
            }
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true          // 开启数据标签
                },
                enableMouseTracking: false // 关闭鼠标跟踪，对应的提示框、点击事件会失效
            }
        },
        series: [{
            name: '东京',
            data: [7.0, 6.9, 9.5, 14.5, 18.4, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
        }, {
            name: '伦敦',
            data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
        }]
    });





});
