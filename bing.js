// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.11
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
var pause_time = 9; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["习近平在马来西亚媒体发表署名文章", "中央提级巡视昆明", "美国被曝要去深海非法挖稀土", "美滥施关税乱上加乱", "男子花155万买迈巴赫S480跑滴滴", "家具厂女员工拒绝向普京透露工资", "反网络霸权 网警在行动", "敦煌网在美爆火", "美企业主：付关税也要中国造", "中方出口管制扼住美军工命脉", "因婆家太好女子把亲妹介绍给小叔子", "杭州发生恶性刑事案件？系AI编造", "拜登公开讲话痛斥特朗普", "中央巡视组已进驻6省区 组长亮相", "订婚强奸案男方带打印机做申诉准备", "美称对华加关税因为吃了亏 中方回应", "3月一线城市房价环比上涨", "4名未成年人打车偷89部苹果手机", "超市闭店清仓500多辆购物车丢失", "爱马仕成为全球市值最高奢侈品公司", "原来艺人的收入是这样算的", "牛弹琴：特朗普又要变卦了", "80万起拍的劳斯莱斯幻影流拍了", "山姆放量超10万瓶平价茅台", "消费者称黄子韬卫生巾长度不够", "《编辑部的故事》牛大姐扮演者去世", "夏宝龙：让美国乡巴佬们去哀鸣吧", "7旬老人没有肿瘤被切除5个器官", "“毛子一家生活点滴”曝男方家暴", "差点以为娜扎来泼水节了", "校方回应300年银杏被砍", "叶童被粉丝拽下车", "黑泽良平携林志玲出席兄弟聚会", "2025软科中国大学排名发布", "杰伦·格林：缺乏经验是我们的优势", "网红小猫“悟空”去世", "女生反复长痘 老中医开2块红砖方子", "单亲妈妈背着30斤的孩子送外卖", "医生：猝死的年轻人通常有6个共性", "曹德旺喊话拆“围墙”", "TVB资深演员回应在演唱会当保安", "SU7坠崖车主发文感谢雷军", "罗马华侨夫妇深夜在家门口遭枪杀", "全国男性九价HPV疫苗首针开打", "林更新与女友年龄差11岁", "美国进口订单开始断崖式暴跌", "特斯拉提车11天撞报废车主又提一辆", "全网都在问肖战来武汉干啥", "越南是唯一一个庆祝猫年的国家", "田曦薇像是穿了条丝巾就出门了", "德经济专家预警新一轮全球经济危机"]

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
    let randomDelay = Math.floor(Math.random() * 20000) + 10000; // 生成10秒到30秒之间的随机数
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
            // 检查是否需要暂停
            if ((currentSearchCount + 1) % 5 === 0) {
                setTimeout(function () {
                    location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
                }, pause_time);
            } else {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            // 检查是否需要暂停
            if ((currentSearchCount + 1) % 5 === 0) {
                setTimeout(function () {
                    location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
                }, pause_time);
            } else {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
