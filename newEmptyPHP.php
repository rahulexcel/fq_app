<html>
<head>
	<style type="text/css">
    p.p1 {margin: 0.0px 0.0px 0.0px 0.0px; line-height: 14.0px; font: 12.0px Verdana; min-height: 15.0px}
    p.p2 {margin: 0.0px 0.0px 12.0px 0.0px; line-height: 14.0px; font: 12.0px Verdana}
    p.p3 {margin: 0.0px 0.0px 12.0px 0.0px; line-height: 14.0px; font: 11.0px Verdana}
    p.p4 {margin: 0.0px 0.0px 0.0px 0.0px; line-height: 12.0px; font: 12.0px Verdana}
    p.p5 {margin: 0.0px 0.0px 0.0px 0.0px; text-align: center; line-height: 14.0px; font: 12.0px Verdana; min-height: 15.0px}
    p.p6 {margin: 0.0px 0.0px 0.0px 0.0px; line-height: 14.0px; font: 12.0px Verdana}
    span.s1 {text-decoration: underline ; color: #2d7ec8}
    span.s2 {font: 13.0px Verdana}
    table.t1 {width: 768.0px; margin: 10.0px 0.0px 10.0px 0.0px}
    table.t2 {width: 650.0px}
    td.td1 {width: 768.0px}
    td.td2 {width: 650.0px}
    td.td3 {width: 296.0px; background-color: #d9e5ee; border-style: solid; border-width: 1.0px 1.0px 0.0px 1.0px; border-color: #bebcb7 #bebcb7 transparent #bebcb7; padding: 5.0px 9.0px 6.0px 9.0px}
    td.td4 {width: 19.0px}
    td.td5 {width: 295.0px; background-color: #d9e5ee; border-style: solid; border-width: 1.0px 1.0px 0.0px 1.0px; border-color: #bebcb7 #bebcb7 transparent #bebcb7; padding: 5.0px 9.0px 6.0px 9.0px}
    td.td6 {width: 296.0px; background-color: #f8f7f5; border-style: solid; border-width: 0.0px 1.0px 1.0px 1.0px; border-color: transparent #bebcb7 #bebcb7 #bebcb7; padding: 7.0px 9.0px 9.0px 9.0px}
    td.td7 {width: 295.0px; background-color: #f8f7f5; border-style: solid; border-width: 0.0px 1.0px 1.0px 1.0px; border-color: transparent #bebcb7 #bebcb7 #bebcb7; padding: 7.0px 9.0px 9.0px 9.0px}
</style>
</head>
<body>
<table width="768.0" cellspacing="0" cellpadding="0" class="t1" style="background:#F2EDE9">
    <tbody>
        <tr>
            <td valign="top" class="td1">
                <table cellspacing="0" cellpadding="0" class="t2" width="90%" align="center">
                    <tbody>
                        <tr>
                            <td valign="top" class="td2">
                                <a href="{{store url=""}}"><img src="http://dev.cako.com/skin/frontend/default/cakov2/images/cako-logo.png" alt="{{var store.getFrontendName()}}" height="120"  border="0"/></a>
                            </td>
                            <td style="font-family:cursive;font-size:50px;color:#3a96cf;">&nbsp;&nbsp;&nbsp;Thankyou</td>
                        </tr>
                    </tbody>
                </table>
                </td>
          </tr>
          <tr>
                <td valign="top">
                <table cellspacing="0" cellpadding="0" class="t2" width="90%" align="center" style="background:white;border-radius:15px;padding-bottom:10px;">
                    <tbody>
                        <tr>
                            <td valign="top" style="background:#f8f8f9;border-radius:10px 10px 0 0;">
                                <p class="p2" style="line-height:25px;padding:25px 30px 0px 30px"><b style="color:#3a96cf;font-size: 22px;
font-weight: normal;">Hello {{htmlescape var=$order.getCustomerName()}}</b>,<br>
                                    Thank you for your order from {{var store.getFrontendName()}}. You can check the status of your order by <a href="{{store url="customer/account/"}}"><span class="s1" style="color:#3a96cf">logging into your account</span></a>. If you have any questions about your order please contact us at orders@cako.com or call us at {{config path='general/store_information/phone'}} Monday - Friday, 10am - 6pm PST.</p>
                                <p class="p2" style="padding:5px 30px 10px;">Your order confirmation is below. Enjoy your Treats</p>
                                <span style="padding-left:30px;color:#f28ab2;font-size:28px;">❤&nbsp;<img src="http://dev.cako.com/skin/frontend/default/cakov2/images/cako.png" /></span>
                                <table cellspacing="0" cellpadding="0" class="t2" style="background:white;border-radius:10px 10px 0px 0px;" width="100%">
    <tbody>
        <tr style="background:url('http://dev.cako.com/skin/frontend/default/cakov2/images/foot-top.png');border-radius:10px">
            <td colspan="3" style="padding:20px 20px 10px;color:#fff;text-transform: uppercase;font-size: 16px;font-weight: bold;border-radius:15px 15px 0px 0px;">Order Summary</td>
        </tr>
        <tr>
            <td valign="top" class="td3" style="padding:30px 0;" width="40%">
                <table cellspacing="0" cellpadding="0" width="100%" style="border-right:1px solid #cccccc;padding-left: 20px;min-height: 200px;">
                    <tr>
                        <td><b style="color:#704333;font-family: sans-serif;font-size: 20px;">Billing Summary</b></td>
                    </tr>
                    <tr>
                        <td valign="middle" style="padding-top:15px;">
                            <img src="http://dev.cako.com/skin/frontend/default/cakov2/images/cards/{{var order.getPaymentImage()}}" style="float:left"><span style="padding-left:10px;display: block;float:left;line-height:20px;color:#746c66"> ending in {{var payment_details}}</span>
                        </td>
                    </tr>
                    <tr>
                        <td valign="middle" style="line-height:17px">
                            <p class="p6" style="color:#3a96cf;font-size:14px;font-weight:bold;margin-bottom:5px">{{var billing.firstname}} {{var billing.lastname}}</p>
                            <p class="p6" style="color:#746c66;margin:0px">{{var billing.street1}}&nbsp;{{var billing.street2}}</p>
                            <p style="color:#746c66;margin:0px">{{var billing.city}},&nbsp;{{var billing.region}}&nbsp;{{var billing.postcode}}</p>
                            <p style="color:#746c66;margin:0px">{{var billing.country_id}}</p>
                             <p style="color:#746c66;margin:0px">T: {{var billing.telephone}}</p>
                        </td>
                    </tr>
                </table>
            </td>
            <td valign="top" class="td4" colspan="2" style="padding:30px 0;" width="60%">
                <table cellspacing="0" cellpadding="0" width="100%" style="padding-left: 20px;">
                    <tr>
                        <td colspan="2"><b style="color:#704333;font-family: sans-serif;font-size: 20px;">Receiving Options</b></td>
                    </tr>
                    <tr>
                        <td valign="middle"><p class="p6" style="color:#fc9026;font-size:28px;font-family:cursive;"><img src="http://dev.cako.com/skin/frontend/default/cakov2/images/{{var order.getDeliveryImage()}}" style="float:left" /><span style="display: block;float: left;line-height: 60px;padding-left:10px">{{var order.getShippingDescription()}}</span></p></td>
                        {{if order.checkDeliveryMethod()}}
                        <td valign="top" style="line-height:5px">
                            <p style="color:#3a96cf;font-weight: bold;font-size: 15px;padding-bottom:8px">Delievered to:</p>
                            <p class="p6" style="color:#746c66">{{var delivery.street1}}&nbsp;{{var delivery.street2}}</p>
                             <p style="color:#746c66">{{var delivery.city}},&nbsp;{{var delivery.region}}&nbsp;{{var delivery.postcode}}</p>
                             <p style="color:#746c66">{{var delivery.country_id}}</p>
                             <p style="color:#746c66;padding-bottom:25px">T: {{var delivery.telephone}}</p>
                               <p style="color:#a4a9ae">Ready on</p>
                            <p style="color:#746c66">{{var order.ddate}} @ {{var order.dtime}}</p>
                            {{else}}
                        <td valign="top" class="td7" style="line-height:10px;">
                            <p class="p6" style="color:#3a96cf;font-weight:bold;">{{var order.getDeliveryAddress().format('html')}}</p>
                            <p style="color:#a4a9ae">Ready on</p>
                            <p style="color:#746c66">{{var order.ddate}} @ {{var order.dtime}}</p>
                            {{/if}}

                        </td>
                    </tr>
                    <tr>                                               
                        {{if order.checkDeliveryMethod()}}
                        <td colspan="2" style="color:#746c66;line-height:20px">
                            <p style="color:#3a96cf;font-weight: bold;font-size: 15px;float:left;margin:0px">Delivery Comments: </p>&nbsp;{{var order.ddate_comment}}</td>                                              
                        {{/if}}
                    </tr>
                </table>
            </td>
        </tr>

        <tr>
            <td colspan="2">
                {{layout handle="sales_email_order_items" order=$order}} 
                {{var order.getEmailCustomerNote()}}</p>

            </td>
        </tr>
    </tbody>
</table>
            </td>
        </tr>
    </tbody>
</table>
</body>
</html>
