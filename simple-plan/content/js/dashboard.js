/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 97.50354609929079, "KoPercent": 2.49645390070922};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.16822695035460994, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.08657011191573404, 500, 1500, "Home Page-3"], "isController": false}, {"data": [0.2337063857801185, 500, 1500, "Home Page-4"], "isController": false}, {"data": [0.1553653719552337, 500, 1500, "Home Page-1"], "isController": false}, {"data": [0.22811059907834103, 500, 1500, "Home Page-2"], "isController": false}, {"data": [0.258703481392557, 500, 1500, "Page Returning 200"], "isController": false}, {"data": [0.15174456879526005, 500, 1500, "Home Page-0"], "isController": false}, {"data": [0.0023011176857330702, 500, 1500, "Home Page"], "isController": false}, {"data": [0.41613418530351437, 500, 1500, "Page Returning 404"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 10575, 264, 2.49645390070922, 5385.716784869971, 0, 38964, 2709.0, 13563.999999999995, 24215.59999999999, 28343.399999999987, 227.14092402861007, 8411.51662461472, 149.68991303670768], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Home Page-3", 1519, 0, 0.0, 4035.6675444371294, 136, 18849, 3839.0, 7163.0, 7685.0, 9394.799999999996, 33.19275397154907, 2365.178209265673, 14.586659460153399], "isController": false}, {"data": ["Home Page-4", 1519, 47, 3.0941408821593153, 2308.643844634628, 0, 7137, 2517.0, 4065.0, 4645.0, 4933.599999999999, 33.21961247430346, 254.48141084257315, 13.80095569260377], "isController": false}, {"data": ["Home Page-1", 1519, 67, 4.410796576695194, 2491.350888742594, 0, 9191, 2094.0, 5095.0, 6124.0, 7211.399999999999, 35.386479056981784, 725.8429431973046, 14.237164684573452], "isController": false}, {"data": ["Home Page-2", 1519, 15, 0.9874917709019092, 2145.6372613561557, 6, 16528, 1776.0, 3978.0, 4684.0, 6705.199999999997, 34.9782393441868, 138.95685845643263, 14.91511617196675], "isController": false}, {"data": ["Page Returning 200", 833, 1, 0.12004801920768307, 2163.4585834333716, 174, 17168, 1579.0, 3147.2, 4330.9, 16733.18, 20.42768159301584, 286.43096844499485, 8.587657560449262], "isController": false}, {"data": ["Home Page-0", 1519, 0, 0.0, 6842.676102699131, 342, 15455, 8492.0, 12416.0, 13015.0, 13968.6, 35.50309687974758, 687.0750692050368, 14.561817079583967], "isController": false}, {"data": ["Home Page", 1521, 131, 8.61275476660092, 17887.61669953978, 1034, 38964, 20970.0, 27773.6, 28701.3, 31035.26, 32.66963077517882, 4005.1254795868504, 68.31373202472238], "isController": false}, {"data": ["Page Returning 404", 626, 3, 0.4792332268370607, 1389.9520766773157, 240, 6196, 1276.0, 2175.9, 2737.65, 5319.770000000002, 16.393442622950822, 183.46207031863773, 6.755379916723406], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: host.docker.internal:8181 failed to respond", 135, 51.13636363636363, 1.2765957446808511], "isController": false}, {"data": ["Assertion failed", 129, 48.86363636363637, 1.2198581560283688], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 10575, 264, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: host.docker.internal:8181 failed to respond", 135, "Assertion failed", 129, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["Home Page-4", 1519, 47, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: host.docker.internal:8181 failed to respond", 47, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Home Page-1", 1519, 67, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: host.docker.internal:8181 failed to respond", 67, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Home Page-2", 1519, 15, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: host.docker.internal:8181 failed to respond", 15, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Page Returning 200", 833, 1, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: host.docker.internal:8181 failed to respond", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Home Page", 1521, 131, "Assertion failed", 129, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: host.docker.internal:8181 failed to respond", 2, "", "", "", "", "", ""], "isController": false}, {"data": ["Page Returning 404", 626, 3, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: host.docker.internal:8181 failed to respond", 3, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
