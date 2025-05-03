// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.24
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
var default_search_words = ["总书记为谋划“十五五”划重点", "五一最火穷鬼超市被3万人搬空货架", "瘦如孙燕姿也难逃中年发福", "稳岗扩岗专项贷款已发放超6400亿", "特朗普生日当天 美国将举行阅兵式", "孙俪新剧与董子健拥抱的戏火了", "漓江竹筏密密麻麻 网友：像赤壁之战", "赵心童淘汰奥沙利文", "王贤才逝世 曾推动实行双休日制度", "古人过假期 怎么发朋友圈", "车站回应被困动车4小时有何补偿", "中央广播电视总台：未邀请韩团巡演", "苏州一直升机坠落致1死4伤", "全红婵陈芋汐回应小天鹅表演", "3男孩从汽车天窗探出身体 交警回应", "96岁李嘉诚终于现身", "比尔盖茨被曝患阿斯伯格综合征", "8连鞭！赵心童第二阶段零封奥沙利文", "阿根廷近海发生7.4级地震", "撒贝宁夫妇带儿女骑行 妻子白到发光", "全红婵陈芋汐夺冠", "马斯克离开白宫后 特朗普开始挖苦他", "悬崖睡床火了 打卡者腰围不能超3尺", "章泽天近照曝光 与杨天真在国外徒步", "美国人正绕过关税打飞的来华购物", "被意大利人骂秦腔穷 中国小伙回击", "世界第一高坝首蓄成功", "主刀医生能离开患者几分钟？医生发声", "农药喷进游客嘴里 西湖景区：属实", "黄晓明陈梦家庭聚餐同框", "职校学生运动会后集体退超60件裙子", "5亿遗产高中生坠亡案再诉被驳", "全红婵再现神级采访", "12306回应：晚点无赔偿", "27岁女孩做陪诊师最高月入十万", "西安雷雨交加出现超大闪电", "饶毅再谈协和：医生培养不是越久越好", "港媒再评李嘉诚卖港口：执迷不悟", "胖东来向胖都来寄律师函", "赵又廷“财富自由”：圆圆不管我花钱", "年轻人五一流行起“捡搭子”旅游", "荣昌政府食堂大厨手都炒麻了", "唐国强面试被问加班 直言有劳动法", "省长夜访 走进一家咖啡店", "陈丽君扮演贾宝玉却说他是长子长孙", "游客抽烟致河南一景区卫生间着火", "华晨宇红发冷脸帅成这样", "董力婚后瞒着阿诺和初恋单独吃饭", "湖南省军区司令员调整", "中国队夺跳水世界杯总决赛首金", "北京男篮时隔10年再进CBA总决赛"]

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
