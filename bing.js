// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.374
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
var default_search_words = ["党的二十届四中全会擘画发展蓝图", "今天是第一个台湾光复纪念日", "金正恩参谒中国人民志愿军烈士陵园", "这场重磅发布会干货满满", "学校每人收240元电话费 收费超百万", "网友拍下龙卷风“幼崽” 宛若小蛇", "台湾重回中国版图80年了", "员工脚痛请假因步数超1.6万被开除", "美股收盘：特斯拉市值蒸发超3600亿元", "汽修工因撞脸成龙走红", "台青：台湾人就是堂堂正正的中国人", "河南南阳暴发猪瘟系谣言", "湖北48岁男子驾车致1死多伤被刑拘", "“中国天眼”捕获来自星星神秘讯息", "男子离婚后带7个娃全网道歉求复合", "我们永远铭记197653位抗美援朝烈士", "国考报名人数超350万创新高", "这哪是放烟花 明明是在给天空刷特效", "今天一起致敬最可爱的人", "“吃苦幼儿园”为何能走红", "吴荣元：光复后首件事是恢复祖先牌位", "李佳琦双11卖的电动牙刷两年前生产", "“摸金校尉”在村里租房3年秘密寻墓", "9000亿元！央行发布重要公告", "75年前的今天：抗美援朝第一仗", "何赛飞真人秀综艺首秀", "当地回应87岁大爷骑三轮送桶装水", "牛弹琴：加拿大被杀鸡儆猴了", "KK园区超800人逃入泰国", "教育部：严禁将手机带入课堂", "正直播NBA：骑士vs篮网", "87岁大爷送桶装水 网友捐款送推车", "杨幂刘亦菲晚宴坐一桌", "女子花几十块买猪食槽收纳孩子玩具", "眼科医院打造“亚朵病房”被起诉", "“业务员”让上千万养老钱打水漂", "15万现金被男子当垃圾扔了", "俄总统新闻秘书：俄日双边合作降至零", "白宫右翼被拆 美国民众暴怒", "国台办回应设立台湾光复纪念日", "高铁推出17元盒饭：门店现炒", "人民日报点赞“卷尺哥”", "俄战略轰炸机在日本完成例行巡航", "国家文物局：卢浮宫被盗敲响警钟", "美国驻哥伦比亚大使馆暂时关闭", "成都一寿司广告被吐槽饭缩力拉满", "张翔宇0-3不敌早田希娜", "日本新首相“鹰派”施政方针引担忧", "U17女足世界杯中国队挺进16强", "美军出动无人机监控加沙地带停火", "美军部署“福特”号到拉美周边水域"]

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
