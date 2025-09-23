// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.311
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
var default_search_words = ["丰收时节感悟总书记的“三农”情怀", "深圳机场飞机被“五花大绑”防台风", "疑追风观浪 香港一对母子被卷入海", "盘点新疆的全国之“最”", "驴肉价格上涨 中国正面临缺驴问题", "用一条毛巾避免大窗玻璃离家出走", "护网：社交账号不受控制？木马在作祟", "鸿蒙智行秋季新品发布会", "“晚1秒就撞 我肯定不惯着他”", "中国每年吃掉约70亿只白羽肉鸡", "台风逼近香港 疑海水倒灌现3米喷泉", "安徽3人为博取关注造谣被罚", "女性内衣凭啥又贵又难穿", "女子术后20天发现体内留纱布已发臭", "台风桦加沙最新研判：个头大极端性强", "广东居民窗上贴“麦”字：因为麦克风", "医院报告单现不文明用语 卫健局回应", "今晚是国庆节前油价最后一次调整", "始祖鸟道歉是认错还是息事宁人", "马未都：买的东西10年翻百倍不叫捡漏", "追踪超强台风“桦加沙”", "男子嫖前猝死 家属索赔卖淫女131万", "3×8还是8×3 争论比答案更有价值", "乌鲁木齐天山后峡发现一只死亡雪豹", "防御台风 广东累计转移超37万人", "这架飞机竟往超强台风桦加沙里钻", "“桦加沙”风眼相当于三个香港", "深圳市台风预警信号升级为红色", "今日头条被网信部门约谈警告", "台风“桦加沙”已致台湾6人受伤", "男子离家多年突然回家 父母没认出", "马克龙被美警察拦下 当场打给特朗普", "特朗普警告孕妇别吃“泰诺”", "南京地下室被猜测凶宅 房主报警", "被特朗普痛批的脱口秀主持人将复出", "中国海军已配齐“航母五件套”", "台风即将登陆 珠海天空现绚烂晚霞", "广州伤医事件医生已脱离生命危险", "致“网红”罗几遇难的肇事者已自首", "市场监管总局约谈货拉拉", "医院通报“CT报告单现不文明用语”", "男子回应采菌遭黑熊一掌打下山昏迷", "被遛狗不牵绳邻居打伤案一审宣判", "偏瘫患者靠脑机接口重新行走", "上海一海洋公园入园要翻包 禁带食物", "中方回应是否与美讨论增加进口大豆", "广州宣布停工停业停市停课停运", "860万大奖过期无人领 福彩回应", "巴代表在伦敦上空升起巴勒斯坦国旗", "拜登前助手获得俄罗斯国籍", "中方驳斥美日韩涉台涉南海言论"]

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
