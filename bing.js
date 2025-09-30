// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.324
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
var default_search_words = ["二十届四中全会10月20日至23日召开", "内塔尼亚胡向卡塔尔道歉", "人民网评“鸡排哥”爆火", "文化旅游事业五年成绩单来了", "浴室灯亮了一天一夜 邻居报警了", "中国飞艇与世界第一大桥硬核同框", "三代人坚持寻找 解开爷爷失联之谜", "卡塔尔回应内塔尼亚胡道歉", "31省生育友好指数排名 云南位列第一", "我们的5098 烈士纪念日致敬抗战英烈", "埃尔多安下令驰援加沙", "网民用AI生成台风损毁房屋图片被罚", "苏醒就胡辣汤言论道歉", "美联邦特工追捕外卖小哥被灵活躲开", "河北、山西天空现神秘光带 专家发声", "特朗普称以总理已接受加沙和平计划", "中国女孩埃及旅游失联：涉电诈被捕", "17岁“小胖丫”跳拉丁舞火出圈", "5岁男童在景观池触电身亡", "普京签令：征兵135000人", "烈士陵园的细节满载敬意和思念", "千万网红猴哥说车疑似离婚", "今天 致敬人民英雄", "北京天空现神奇火箭云", "演唱会已火到让铁路局加列车", "“多想有你在场”！童声合唱致敬英雄", "“我们既然有希望 便不能不有牺牲”", "故宫乾隆花园重开 高清美景抢先看", "歼-35战机机甲重磅亮相", "这个“地摊” 不卖东西只救命", "郑钦文回应中网退赛", "青岛保时捷女销售9月再夺销冠", "网友雨中邂逅“山中精灵”", "维达抽纸被曝有黄色不明物体", "80后脂渣哥年炸600吨肉", "胡辣汤协会回应苏醒拉踩河南胡辣汤", "四川一初中8人宿舍住9名男生", "台积电和三星在美工厂遇大麻烦", "外交部回应罗冠聪被拒入境", "西班牙正式取消从以购买子弹的合同", "马达加斯加总统解散政府", "河南培育钻石刷新世界纪录", "中方驳美议员称中国歪曲联大决议", "3岁幼童2楼坠落幸好被邻居双手接住", "外国小姐姐吐槽中文太难懂", "“鸡排哥”证明真诚是最好的品牌", "陈俊菘：张本智和之前比较嚣张", "中方敦促日方停止列单中企错误做法", "拉美国家齐“开火” 美国形象翻车", "鸡排哥：十一假期一定能把控全场", "窃贼打地道潜入一金店行窃"]

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
