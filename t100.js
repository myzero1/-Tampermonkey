// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://top.taobao.com/*
// @match        https://www.baidu.com/?to_top=1
// @grant GM_setValue
// @grant GM_getValue
// @require    http://libs.baidu.com/jquery/1.9.0/jquery.min.js
// ==/UserScript==

//---------------------
$(document).ready(function(){
    go_top();

    //---------to top--------------
    function go_top(){
        console.log('go_top');
        var index_url = 'https://www.baidu.com/?to_top=1';
        if (window.location.href==index_url) {
            if (get_last_file_name()!=false) {
                var sHtmlA = '<a id="go_top" target="_self" href="https://top.taobao.com/index.php?topId=TR_FS&leafId=50012027&rank=search&type=hot&s=0">to top</a>';
                $("#lg").before(sHtmlA);
                $('#go_top')[0].click();
            }
        } else {
            main();
        }
    }

    //---------to fetch-------
    function main(){
        console.log('main');
        get_last_file_name();
        //------to fetch------
        get_mulit_page();

        //------to save---------

        if (is_end_page()) {
            save_to_file(sFileName);
        } else {

        }


    }

    //---------is end page--------------
    function get_last_file_name(){
        console.log('get_last_file_name');
        var myDate = new Date();
        var year = myDate.getFullYear();    //获取完整的年份(4位,1970-????)
        var month = 1+myDate.getMonth();       //获取当前月份(0-11,0代表1月)
        var date = myDate.getDate();        //获取当前日(1-31)
        var sDate = year+'-'+month+'-'+date+'.csv';
        var sFileName = GM_getValue("sLastFileName","");
        if (sFileName=="") {
            sFileName = sDate;
        } else {
            if (sFileName==sDate) {
                return false;
            } else {
                sFileName = sDate;
            }
        }

        GM_setValue("sLastFileName",sDate);
    }

    //---------is end page--------------
    function is_end_page(){
        console.log('is_end_page');
        var active_next = $('.items .item.active').next();
        if (active_next.hasClass('next')) {
            return true;
        } else {
            return false;
        }
    }


    //--------save to file-----
    function save_to_file(sFileName){
        console.log('save_to_file');
        var str = GM_getValue("sRows","");
        str =  encodeURIComponent(str);
        var oDownloadA = $('.switch-item').last().find('a');
        oDownloadA.attr('download', sFileName);
        oDownloadA.attr('href', "data:text/csv;charset=utf-8,"+str);
        oDownloadA[0].click();
        GM_setValue("sRows","");
        GM_setValue("sLastFileName",sFileName);
    }


    //--------get mulit page-----
    function get_mulit_page(){
        console.log('get_mulit_page');
        get_one_page();
        if (is_end_page()) {
            //return false;
        } else {
            var active_next = $('.items .item.active').next();
            var href = active_next.find('a').attr('href');
            window.location.href=href;
        }
    }

    //---------get one page------
    function get_one_page(){
        console.log('get_one_page');
        var rows = new Array();
        $('.J_contentRow .row').each(function(){
            var title = $(this).find('.col2 .title').text();
            var focus_bar = $(this).find('.col4 .focus-bar').text();
            var up_down = $(this).find('.col5').text();
            var up_down_icon_tmp = $(this).find('.col5 .icon-btn-bang-1-trend icon').length;
            var up_down_icon = up_down_icon_tmp==1 ? '+' : '-';
            var up_down_percent = $(this).find('.col6').text();
            var up_down_percent_icon_tmp = $(this).find('.col6 .icon-btn-bang-1-trend icon').length;
            var up_down_percent_icon = up_down_percent_icon_tmp==1 ? '+' : '-';

            //var row = title+','+focus_bar+','+up_down_icon+up_down+','+up_down_percent_icon+up_down_percent+"\n";
            var row_array = new Array();
            row_array.push(trim(title));
            row_array.push(trim(focus_bar));
            row_array.push(trim(up_down_icon)+trim(up_down));
            row_array.push(trim(up_down_percent_icon)+trim(up_down_percent));
            var row = row_array.join(',');
            rows.push(row);
        });

        var sRows = rows.join("\n");
        var sRowsNew = GM_getValue("sRows","") + sRows + "\n";
        GM_setValue("sRows",sRowsNew);
    }

    // ------unit funciton-------
    function trim(str)
         {
             return str.replace(/(^\s*)|(\s*$)/g, "");
     }
});
