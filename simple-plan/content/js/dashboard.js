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

    var data = {"OkPercent": 93.1202844582821, "KoPercent": 6.879715541717895};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.1942736849553765, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.07074214365881032, 500, 1500, "Home Page-3"], "isController": false}, {"data": [0.18799102132435466, 500, 1500, "Home Page-4"], "isController": false}, {"data": [0.14355359147025815, 500, 1500, "Home Page-1"], "isController": false}, {"data": [0.18932379349046016, 500, 1500, "Home Page-2"], "isController": false}, {"data": [0.2839174058455722, 500, 1500, "Page Returning 200"], "isController": false}, {"data": [0.3429783950617284, 500, 1500, "Home Page-0"], "isController": false}, {"data": [0.0031161276919880894, 500, 1500, "Home Page"], "isController": false}, {"data": [0.3453467825062583, 500, 1500, "Page Returning 404"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 113057, 7778, 6.879715541717895, 4328.158689864329, 0, 68793, 1271.0, 8732.0, 18661.650000000005, 34345.53000000007, 361.11332922361447, 12022.753535998501, 219.24685130889486], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Home Page-3", 14256, 305, 2.139450056116723, 4241.708824354651, 15, 31792, 2992.0, 8511.300000000001, 11405.3, 23278.120000000054, 45.54836318557379, 3178.7480017327052, 19.588130289773346], "isController": false}, {"data": ["Home Page-4", 14256, 2040, 14.30976430976431, 2481.191077441068, 0, 30223, 1716.0, 4200.0, 6413.749999999998, 22535.490000000013, 45.554185067072275, 322.0009964278981, 16.734940892358424], "isController": false}, {"data": ["Home Page-1", 14256, 999, 7.007575757575758, 2350.193742985413, 0, 30119, 1944.0, 3608.0, 5012.449999999999, 11708.76000000001, 45.970784560317306, 920.5145389438425, 17.99313335892909], "isController": false}, {"data": ["Home Page-2", 14256, 326, 2.28675645342312, 2383.809062850712, 0, 30151, 1770.0, 4137.300000000001, 5978.15, 16246.29, 45.85161265422172, 181.4249002845624, 19.295084172654352], "isController": false}, {"data": ["Page Returning 200", 13754, 379, 2.755562018321943, 3455.3545877562874, 0, 30218, 1496.0, 9358.5, 13234.5, 26758.350000000002, 44.00111330430637, 603.4077755198219, 18.009669756712615], "isController": false}, {"data": ["Home Page-0", 14256, 0, 0.0, 2817.602483164981, 18, 28606, 1308.0, 7032.000000000011, 16517.899999999998, 19057.15, 46.02926552067055, 890.7831590069612, 18.87919093621253], "isController": false}, {"data": ["Home Page", 14441, 3246, 22.477667751540753, 14474.261062253418, 1, 68793, 12349.0, 28396.800000000047, 34587.7, 50933.93999999996, 46.35419341584921, 5501.278252528399, 92.4263386444504], "isController": false}, {"data": ["Page Returning 404", 13582, 483, 3.5561772934766602, 2156.0550728905932, 0, 30125, 1263.0, 4195.700000000001, 6726.249999999993, 20470.230000000003, 44.08080073738462, 480.9208518210269, 17.603125730244454], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to host.docker.internal:8181 [host.docker.internal/192.168.65.254, host.docker.internal/fdc4:f303:9324:0:0:0:0:254] failed: Network unreachable (connect failed)", 188, 2.4170737978914887, 0.1662878017283317], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: host.docker.internal:8181 failed to respond", 4015, 51.619953715608126, 3.551305978400276], "isController": false}, {"data": ["Assertion failed", 3061, 39.35458986886089, 2.7074838355873587], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 514, 6.608382617639496, 0.4546379260019282], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 113057, 7778, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: host.docker.internal:8181 failed to respond", 4015, "Assertion failed", 3061, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 514, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to host.docker.internal:8181 [host.docker.internal/192.168.65.254, host.docker.internal/fdc4:f303:9324:0:0:0:0:254] failed: Network unreachable (connect failed)", 188, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Home Page-3", 14256, 305, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: host.docker.internal:8181 failed to respond", 210, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 77, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to host.docker.internal:8181 [host.docker.internal/192.168.65.254, host.docker.internal/fdc4:f303:9324:0:0:0:0:254] failed: Network unreachable (connect failed)", 18, "", "", "", ""], "isController": false}, {"data": ["Home Page-4", 14256, 2040, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: host.docker.internal:8181 failed to respond", 1911, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 107, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to host.docker.internal:8181 [host.docker.internal/192.168.65.254, host.docker.internal/fdc4:f303:9324:0:0:0:0:254] failed: Network unreachable (connect failed)", 22, "", "", "", ""], "isController": false}, {"data": ["Home Page-1", 14256, 999, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: host.docker.internal:8181 failed to respond", 965, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 30, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to host.docker.internal:8181 [host.docker.internal/192.168.65.254, host.docker.internal/fdc4:f303:9324:0:0:0:0:254] failed: Network unreachable (connect failed)", 4, "", "", "", ""], "isController": false}, {"data": ["Home Page-2", 14256, 326, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: host.docker.internal:8181 failed to respond", 233, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 75, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to host.docker.internal:8181 [host.docker.internal/192.168.65.254, host.docker.internal/fdc4:f303:9324:0:0:0:0:254] failed: Network unreachable (connect failed)", 18, "", "", "", ""], "isController": false}, {"data": ["Page Returning 200", 13754, 379, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: host.docker.internal:8181 failed to respond", 167, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 125, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to host.docker.internal:8181 [host.docker.internal/192.168.65.254, host.docker.internal/fdc4:f303:9324:0:0:0:0:254] failed: Network unreachable (connect failed)", 87, "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Home Page", 14441, 3246, "Assertion failed", 3061, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: host.docker.internal:8181 failed to respond", 108, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 50, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to host.docker.internal:8181 [host.docker.internal/192.168.65.254, host.docker.internal/fdc4:f303:9324:0:0:0:0:254] failed: Network unreachable (connect failed)", 27, "", ""], "isController": false}, {"data": ["Page Returning 404", 13582, 483, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: host.docker.internal:8181 failed to respond", 421, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 50, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to host.docker.internal:8181 [host.docker.internal/192.168.65.254, host.docker.internal/fdc4:f303:9324:0:0:0:0:254] failed: Network unreachable (connect failed)", 12, "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
