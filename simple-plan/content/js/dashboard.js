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

    var data = {"OkPercent": 95.10034602076125, "KoPercent": 4.899653979238754};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6919261822376009, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.7557265569076592, 500, 1500, "Home Page-3"], "isController": false}, {"data": [0.8437723693629205, 500, 1500, "Home Page-4"], "isController": false}, {"data": [0.8466356478167502, 500, 1500, "Home Page-1"], "isController": false}, {"data": [0.8518253400143164, 500, 1500, "Home Page-2"], "isController": false}, {"data": [0.9604793472718001, 500, 1500, "Page Returning 200"], "isController": false}, {"data": [0.6714387974230493, 500, 1500, "Home Page-0"], "isController": false}, {"data": [0.03812240663900415, 500, 1500, "Home Page"], "isController": false}, {"data": [0.9939088983050848, 500, 1500, "Page Returning 404"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21675, 1062, 4.899653979238754, 3932.8295271049637, 3, 32859, 427.0, 27669.800000000003, 30042.0, 31245.0, 505.2094259142718, 17317.515788705045, 314.87115101945085], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Home Page-3", 2794, 0, 0.0, 496.1675017895497, 14, 1251, 493.0, 863.0, 927.0, 1023.0, 65.28952656914521, 4652.2613238713375, 28.691686480581392], "isController": false}, {"data": ["Home Page-4", 2794, 0, 0.0, 380.0068002863283, 3, 944, 361.5, 688.0, 768.25, 831.0, 65.35672514619884, 511.429139254386, 28.019142909356724], "isController": false}, {"data": ["Home Page-1", 2794, 0, 0.0, 383.35003579098054, 5, 899, 369.5, 696.0, 751.0, 821.0500000000002, 65.23312553991269, 1392.255819018351, 27.456520612990587], "isController": false}, {"data": ["Home Page-2", 2794, 0, 0.0, 361.44309234073006, 3, 872, 340.0, 660.0, 708.25, 793.0500000000002, 65.25750321149131, 260.2015484497256, 28.104061441667643], "isController": false}, {"data": ["Page Returning 200", 1961, 0, 0.0, 511.18969913309525, 66, 15696, 276.0, 462.79999999999995, 525.8999999999999, 13291.279999999999, 51.32298673087492, 720.3762580887355, 21.601764922858486], "isController": false}, {"data": ["Home Page-0", 2794, 0, 0.0, 7459.278095919836, 20, 30013, 348.5, 28244.0, 28867.5, 29607.1, 68.75169172469795, 1330.519799715175, 28.198936058958143], "isController": false}, {"data": ["Home Page", 3856, 1062, 27.54149377593361, 15138.665456431565, 238, 32859, 3990.5, 30574.3, 31254.15, 31956.72, 89.87716476703261, 8121.587778680978, 138.70574500909026], "isController": false}, {"data": ["Page Returning 404", 1888, 0, 0.0, 263.10222457627117, 70, 564, 244.0, 407.0, 453.0, 504.1099999999999, 63.13747784503228, 709.3717603584925, 26.142861920208677], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: host.docker.internal:8181 failed to respond", 42, 3.9548022598870056, 0.19377162629757785], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 1020, 96.045197740113, 4.705882352941177], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21675, 1062, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 1020, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: host.docker.internal:8181 failed to respond", 42, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Home Page", 3856, 1062, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 1020, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: host.docker.internal:8181 failed to respond", 42, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
