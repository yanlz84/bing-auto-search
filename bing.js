// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.297
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
var default_search_words = ["让世界正气充盈 乾坤朗朗", "菲律宾船对中国海警举白旗", "589092元善款 全额退还28689位网友", "14亿中国人的饭碗端得更牢", "地球臭氧层正在恢复", "六小龄童回应“烦死了”表情包", "净网：男子蹭明星流量造谣着火被拘", "鸿蒙智行 享界 S9T新品发布会", "女孩神似刘亦菲 三条视频涨粉20万", "菲船只故意冲撞 中国海警水炮喷射", "东南亚惊现1.2万年前木乃伊", "广东一20斤蟒蛇生吞牛犊", "以总理：有手机就等于握着“以色列”", "涉毒艺人苏永康温州演唱会取消", "#金价大涨让谁疯狂了#", "劳斯莱斯车主吐槽女子人肉占车位", "女子误触化骨水去世 附近居民发声", "西藏绿电仅需0.009秒就能闪送到广东", "太二门店客服称全部活鱼现杀", "《731》全球首映式在哈尔滨举行", "中国达成协议的三个“绝不牺牲”", "地球臭氧层正在恢复意味着什么", "中方回应“中美领导人是否将通话”", "12306回应卧铺乘客打伞遮隐私", "外交部回应菲船只故意撞击中国船只", "国防部回应福建舰通过台湾海峡", "17辆报废火车193.5万起拍", "中方回应美在日部署中导：尽快撤走", "3岁娃写书法挥毫泼墨行云流水", "网红“柴怼怼”被刑拘", "降温4℃到8℃ 大范围冷空气来了", "男子行凶致3死1伤 研究生制止被刺死", "“化骨水”事发地又挖出两壶氢氟酸", "电影《志愿军：浴血和平》发布预告", "北京市民发现日本侵华生物战罪证", "12岁女孩遭虐致死案二审择期宣判", "深圳鼓励外卖员随手拍“黑餐馆”", "中国车企在欧洲打开新局", "联合国认定以色列犯种族灭绝罪", "中方：美不能既让中方照顾又打压中企", "扩大服务消费！9部门发文", "女子误踩化骨水身亡 救治细节曝光", "中宣部原副部长张建春一审获刑14年", "四川一小区“土味区块链”火了", "“美国发现自己落后了”", "国防部：“香山时刻”即刻到来", "德总理默茨回忆二战纳粹罪行哽咽", "女子踩化骨水去世 事发地为征迁区域", "大兴安岭迎来今秋首场降雪", "李在明下令严查海警殉职事件", "向太称曾借刘德华4000万 还没打欠条"]

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
