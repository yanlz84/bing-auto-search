// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.23
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
var default_search_words = ["感悟总书记的劳动本色", "游客在荣昌政府食堂1天吃了千斤猪肉", "四川芬达再道歉 求杨坤“留口饭吃”", "五一假期出游锦囊", "悬崖睡床火了 打卡者腰围不能超3尺", "被意大利人骂秦腔穷 中国小伙回击", "世界最长寿老人去世 享年116岁", "董某事件中最无辜的受害者出现了", "黄晓明陈梦家庭聚餐同框", "大数据看五一假期出游", "游客为举国旗夜爬男子照亮上山路", "中央广播电视总台：未邀请韩团巡演", "马斯克离开白宫后 特朗普开始挖苦他", "董力婚后瞒着阿诺和初恋单独吃饭", "假期最好的休息不是睡大觉", "杨迪晒与娜扎合照陈哲远他急了", "荣昌真的接住了泼天流量", "车站回应被困动车4小时有何补偿", "商家称曾接泰山外卖订单但无人配送", "娜扎33岁生日 杨迪晒合照陈哲远急了", "主刀医生能离开患者几分钟？医生发声", "全红婵陈芋汐最后一跳水花消失", "美国再爆发大规模反特朗普游行示威", "假期首日泰山跻身全国景区热度前五", "杨洋疑似新恋情曝光", "印巴双方均强硬表态 称不会让步", "云南一网约车司机中500万大奖", "全红婵再现神级采访", "特朗普建议商科学生去“搬砖”", "美回应鲁比奥或赴俄阅兵：未确认行程", "特朗普：立即停止购买伊朗石油", "叶童《乘风2025》三公第一", "美国民众：特朗普应被送进精神病院", "上海外滩到底来了多少人", "荣昌政府食堂大厨手都炒麻了", "游客开始自主开发隐藏景点了", "中国万架无人机点亮越南夜空", "赵又廷“财富自由”：圆圆不管我花钱", "北京这么挤 到底有谁在啊", "去年没用完的防晒霜今年还能用吗", "唐国强面试被问加班 直言有劳动法", "微信上线新模式 网友：更省心了", "男子乘车遇野生东北豹", "新势力4月销量：零跑夺冠 小米下滑", "Ella王蓉心跳舞台气血感好足", "陈丽君扮演贾宝玉却说他是长子长孙", "农药喷进游客嘴里 西湖景区：属实", "杨迪祝娜扎生日快乐", "湖南省军区司令员调整", "马丽自曝8岁时父母离异", "刘雨欣希望饰演抑郁症患者"]

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
