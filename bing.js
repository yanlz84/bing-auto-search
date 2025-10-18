// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.361
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
var default_search_words = ["美丽中国铺展新画卷", "郑丽文当选中国国民党主席", "国航客机空中起火 亲历者发声", "中国能源领域迎来多个新突破", "女子称入住酒店遇离谱“走光”", "都要穿羽绒服了 大闸蟹怎么还没上市", "护网：WannaCry勒索风暴的警示与防范", "清华大学设杨振宁吊唁处", "李在明女翻译因高颜值走红", "老夫妇扎堆领结婚证 民政局回应", "半年出海7次未带1条鱼 背后是桩大案", "“过期药没变质还可服用”是假的", "清华公开杨振宁生前教学画面", "杨振宁留给大家的8个字", "市民冒雨到杨振宁旧居缅怀", "与已婚女同居博士生被解除公派留学", "小S夺金钟奖 后台崩溃大哭", "男子黔灵山扇猴脸被猴子飞踹", "潮牌3万元直角皮鞋被嘲俯卧撑专用", "韩4大集团CEO同赴特朗普“鸿门宴”", "月亮姐姐宣布离开央视少儿频道", "金饰价格跌至1253元", "北京山区下雪了", "杨振宁曾表示去世后支持翁帆再婚", "巴基斯坦空袭阿富汗东部致17死16伤", "这4种电话 别接别回别点", "初代知名网红南笙官宣当妈", "长沙一对情侣撞脸欧豪和刘浩存", "杨振宁谈曾放弃中国籍：是痛苦的决定", "女子出事故自称国企的 警方通报", "苏超半决赛：南京vs泰州", "内蒙古一煤矿发生爆炸 现场烟雾满天", "美乌总统会晤气氛紧张 特朗普情绪化", "红山动物园放弃抵抗 采用野菜F4", "吴石墓前祭奠的市民络绎不绝", "BLG不敌G2", "GEN战胜T1", "15947架无人机表演打破吉尼斯纪录", "山西忻州发生3.9级地震", "杨振宁逝世", "设计师回应“人体蜈蚣”雕塑争议", "4岁失联女童称睡醒后自行下车", "45万到账 他们带9面锦旗冲进派出所", "俄提议建“普京-特朗普隧道”", "新一轮较强冷空气来袭 影响有多大", "一单“玫瑰花”生意牵出300万大案", "清华大学发文悼念杨振宁", "苏丹霍乱疫情造成超12万人被感染", "俄军苏-57曝内置主弹舱细节图", "国外飞涨 我们的蛋价为何稳得住", "杨振宁：基本每次回国美特工都来盘查"]

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
