// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.343
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
var default_search_words = ["以文化人 以文育人", "男子救一家三口牺牲 中央政法委表彰", "湖北一地“蟹王”“蟹后”拍出1.9万", "这个假期全国文旅市场人气旺", "6.6万定制婚礼脸上打绿光像“迪厅”", "电动轮椅加后视镜 老人躺着超车", "净网：多人发布虚假天气信息被罚", "女生找回手机后发现相册多了段视频", "胖东来国庆8天卖了8.2亿", "海底捞小便事件220万判决已生效", "北京今天最高气温创74年来同期最低", "杭州人“短袖都洗出洞了”", "许家印家族信托“防火墙”被击穿", "曝乌总统每月转5千万美元到沙特银行", "“郑州变成巨大的补水喷雾”", "明年买新能源车 购置税减免有新要求", "74岁大爷钓鱼钓成“老抽色”", "金正恩称10年内要实现“新的巨变”", "美雇员未申报与中国人恋爱被解雇", "亲生儿子多次将母亲遗弃荒野", "Sora2爆火 人们更担心它的破坏力了", "四川甘孜发生5.4级地震", "女子获刑后4年3次卡点怀孕？法院回应", "多地景区现香港老牌明星“再就业”", "杨乐乐回应独自手术汪涵未陪同", "谢霆锋模仿者为引发拥堵道歉", "为啥最近蚊子叮人更“凶”了", "印度校园水塔现腐尸 师生喝10天尸水", "中国、印度将恢复直航", "安徽六安发生3.4级地震", "中方回应中美领导人是否在APEC会晤", "A股10月开门红 沪指站稳3900点", "女子照顾车祸丈夫突发疾病进ICU", "四川女子在自家露台开多肉商店", "问AI如何谋杀同学 美13岁男生被捕", "“销售的烧鸡有七条鸡腿”商家回应", "刘小涛任江苏省副省长 代理省长职务", "北方已翻出秋裤 南方还离不开空调", "男子豪饮8瓶啤酒膀胱被撑破", "第一阶段加沙停火协议正式生效", "以军已停止在加沙地带军事行动", "“一人食”被歧视 韩国网友怒了", "每6个中国人就有1个股民", "14家外国实体被列入不可靠实体清单", "黄子韬徐艺洋自曝要直播婚礼", "湖南省人大常委会副主任乌兰被查", "停火协议生效后 巴媒称以军又开火", "#俄勇士飞行表演队即将亮相南昌#", "广西隧道口滑坡 泥浆如瀑布倾泻而下", "国际金价涨涨涨", "《阿凡达3》内地定档"]

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
