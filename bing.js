// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.176
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["对“一老一小” 总书记特别关心", "歼-15深夜起飞驱离外军机", "辣妹风坑苦了优衣库", "交朋友 共发展", "进机场贵宾厅要验资2000万？银行回应", "大三本科生回应逆天学术履历", "起底宗馥莉亲叔叔宗泽后的商业版图", "飞机起飞后砸向地面？春秋航空回应", "被家暴16次女子前婆婆被判返还91万", "二人利用手机NFC盗走80多万", "曾经“香喷喷”的白酒为啥不香了", "12306能在线换座？官方解答", "特朗普确诊静脉疾病：小腿轻微肿胀", "马云西湖边骑单车被偶遇", "知名华裔演员为捡手机从8楼坠亡", "毕业即月薪过万的本科生不足10%", "杜淳妻子聊名媛培训班", "外机抵近 航母官兵兴奋：到我上场了", "马云骑行同款单车售价1.85万", "文旅局回应袁姗姗在哀牢山拍摄", "雪王“亲儿子”要抢攻一线城市", "工作人员回应进丽江古城要交50元", "北极圈人热到光膀子上街", "妈妈支持女儿暑假不报班在家做面包", "宾利车肇事逃逸 警车一路追踪喊话", "李小萌全网寻广西贫苦少年韦仁龙", "国安部：有国家千方百计窃取中国稀土", "徐正源炮轰成都蓉城高层", "外国网红在中国街头栽赃路人", "巴西11岁女孩拔牙时发现81颗牙齿", "雷军陪比亚迪CEO王传福参观小米工厂", "用绳牵智障儿子环卫工拒绝社会捐赠", "女飞前辈亲手送录取通知书", "孙颖莎回应新身份", "以色列红海唯一港口将全面关闭", "学校回应强制要求学生暑期来校补课", "电影《三滴血》定档11月15日", "白领兼职骑单车送外卖 8天瘦2斤", "动物园老虎饿到吃草？工作人员回应", "游客“蛇形走位”逃避边防检查被罚", "泽连斯基称或与特朗普达成巨型交易", "河南淅川突刮9级以上雷暴大风", "游客拍照不慎将孩子撞落水 众人救援", "别停摩托车并骂人男子已被拘留", "儿子失散19年 母亲见面塞19个红包", "牛弹琴：特朗普让欧洲人头都大了", "中央气象台7月18日发布高温黄色预警", "谢娜父母女儿爱人工作的排序", "韩国多地破纪录暴雨已致4死", "可口可乐改配方或致美国增加糖进口", "天安门城楼维护检修后重新亮相"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
