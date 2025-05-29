// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.76
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
var default_search_words = ["筑牢强国建设 民族复兴的文化根基", "美国法院叫停特朗普关税政策", "国台办：公安机关将公开通缉台黑客", "这样的龙舟赛感觉我也能玩", "“听孩子说话跟加密一样听不懂”", "中国下司犬外网爆火 被称为中国狗王", "比亚迪回应经销商集团“暴雷”", "53岁汪峰被孟子义公开卸妆", "国补后iPhone16Pro重回销量第一", "宋佳是来红毯过冬的吧", "马斯克官宣即将离开特朗普政府", "重庆一车站爆破拆除前未疏散？假", "男子杀母亲女友带嫂嫂潜逃32年落网", "高考人数8年来首降 竞争压力小了吗", "以总理：哈马斯高级指挥官辛瓦尔死亡", "结婚4天离婚男子要回彩礼18万", "黄晓明增重30斤演智力障碍人士", "德国宣布将向乌克兰提供50亿欧军援", "DeepSeek开源新版R1 媲美OpenAI o3", "朱媛媛捐遗产和眼角膜？全是臆想编造", "漓江文学奖得主哽咽回忆过世女友", "英伟达第一财季净利润同比增长26%", "中国小朋友不能再胖了", "全红婵新家地基完美收工", "榴莲不让带进火车站 4人光速炫完", "DeepSeek R1模型已完成小版本试升级", "冬天冷到-48℃的地方热成全国第一", "谁给赵今麦选的裙子", "郑钦文系鞋带速度惊呆外国人", "中国航母为何靠近日本？外交部回应", "曹德旺：福耀科大8亿预算招50个学生", "于正：吴谨言又杀回来了", "林允穿半透明纱裙身材好绝", "男子看诈骗新闻惊觉自己被女友骗", "上海多个地铁站外有“一刀切”操作", "热热热 地球“发烧”或成常态", "公园“司马光砸缸”雕塑被吐槽像猴", "陈乔恩确诊盲肠炎", "芭莎派对上的陈丽君可甜可酷", "县城的万达广场王健林才舍不得卖", "女子为遮阳戴荷叶化身“巨型绿蚊”", "95后脑瘫女孩送外卖7年改行摆摊", "赵丽颖49秒疯感演技", "美国停止发放任何学生签证 中方回应", "汪苏泷的拍照搭子是真蛇", "熊猫的“DNA身份证”竟是粪便", "丽江古城一网红美食地被指像公厕", "吴彦祖：无论讲啥我们都是中国人", "周雨谈王楚钦网传恋情：造谣会被抓", "母女频繁高空抛物有邻居戴头盔出门", "王健林还剩多少家底"]

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
