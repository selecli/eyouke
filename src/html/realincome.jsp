<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
    <meta charset="UTF-8">
    <title>实时收入</title>
    <meta http-equiv="X-UA-Compatible" content="IE=EmulateIE10"/>
    <meta content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=0" name="viewport"/>
    <meta content="yes" name="apple-mobile-web-app-capable"/>
    <meta content="black" name="apple-mobile-web-app-status-bar-style"/>
    <meta content="telephone=no" name="format-detection"/>
    <link rel="stylesheet" href="<%=request.getContextPath() %>/css/ydui.css"/>
    <link rel="stylesheet" href="<%=request.getContextPath() %>/css/main.css"/>
    <script src="<%=request.getContextPath() %>/js/ydui.flexible.js"></script>
</head>
<body>
<div class="g-flexview">
    <div id="list" class="g-scrollview">
        <div id="listContent" class="m-list list-theme6">

        </div>
    </div>
</div>
<script src="<%=request.getContextPath() %>/js/jquery.min.js"></script>
<script src="<%=request.getContextPath() %>/js/ydui.js"></script>
<script>
    $(function () {
        var $listContent = $('#listContent'), $list = $('#list');
        var page = 1;

        function formatData(time) {
            var t = new Date(time);
            var Y = t.getFullYear();
            var M = t.getMonth() + 1;
            var D = t.getDate();
            var h = t.getHours();
            var m = t.getMinutes();
            var s = t.getSeconds();
            return Y + '/' + M + '/' + D + ' ' + h + ':' + m + ':' + s;

        }

        var load = function (more, callback) {
            if (more) {
                page = 1;
            }
            $.ajax({
                url: '<%=request.getContextPath() %>/realIncomeList.do',
                dataType: 'jsonp',
                data: {"current": page},
                success: function (ret) {
                    var data = ret.data.rows, html = '';
                    $.each(data, function (i, e) {
                        html += '<div class="list-item"><p class="title">' + formatData(e.createTime) + '</p> <p>交易渠道<span>' + e.payType + '</span></p> <p>订单编号<span>' + e.orderId + '</span></p> <p>订单金额<span>' + e.orderAmount + '</span></p> </div>';
                    });
                    if (more) {
                        $listContent.append(html);
                    } else {
                        $listContent.html(html);
                        var tipStr = data.length > 0 ? '为您更新了' + data.length + '条内容' : '已是最新内容';
                        YDUI.dialog.toast(tipStr, 'none', 1500);
                    }
                    ++page;
                    typeof callback == 'function' && callback(data);
                }
            });
        };

        $listContent.pullRefresh({
            loadListFn: function () {
                var def = $.Deferred();
                load(false, function () {
                    def.resolve();
                });
                return def.promise();
            }
        });
        $list.infiniteScroll({
            binder: '#list',
            pageSize: 10,
            initLoad: false,
            loadListFn: function () {
                var def = $.Deferred();
                load(true, function (listArr) {
                    def.resolve(listArr);
                });
                return def.promise();
            }
        });

    });
</script>
</body>
</html>