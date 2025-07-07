// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.155
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
var default_search_words = ["铭记历史 吾辈自强", "男子拒绝手术 医生自掏3万也要救", "国防部驳斥“中方破坏阵风销售”", "遇上台风天 注意这9点", "陈梦妈妈瞒着家人偷户口本结婚", "中国旅游团在意大利被洗劫一空", "一对亲兄弟在桂林不幸溺亡 亲友发声", "外交部回应“印度称中国借刀杀人”", "罗马仕退款排到17万位", "罗家英患癌放弃化疗 妻子汪明荃回应", "金毛疑餐馆蹭空调被打死主人发声", "横店短剧演员高强度工作去世？假", "16个外甥来过暑假舅舅称背后没团队", "中方回应美将与中方磋商收购TikTok", "烟台南山学院学生称每年学费上万", "警方通报42岁男子杭州南站坠楼", "#大学宿舍没空调会成为招生减章吗#", "五六台救护车进高校 学校称不知情", "杭州南站有人坠楼 工作人员回应", "朴宝剑晒与刘诗诗李庚希自拍", "陪看东亚杯：中国vs韩国", "中百万大奖女子与摊主协商达成一致", "女子起诉银行借1.12亿不还 一审重审", "丽江失联的20岁女大学生已确认身亡", "一秒天黑 济南突降暴雨", "高端奶粉卖不动了？飞鹤股价大跌", "香港市民送别山东舰编队 场面震撼", "内蒙古一景区载3人观光飞机坠地", "黄宗泽不结婚是为了气妈妈", "红米K90系列曝光：配骁龙强芯", "血铅异常患儿家长：借钱也要治病", "中方回应美要对金砖国家加10%关税", "陈梦回应退出世界排名：有舍才有得", "警方回应金世佳身份证照片佩戴眼镜", "特朗普回应马斯克成立美国党：荒谬", "苏超开罚单：杨笑天因不文明动作被罚", "李荣浩被常州热出双眼皮", "三黄片现金买18元刷医保26元", "七七事变88周年", "业主欠费60万元 头部物业公司不干了", "考古梓渝都是笑料没黑料", "66岁倪萍回应整容传闻：就是老了", "中方回应如何应对美征收额外关税", "澳洲男生庆祝与女友同居 后空翻身亡", "美国洪灾致82死 特朗普：拜登的错", "中国央行连续第8个月增持黄金", "男子走出空调房竟瞬间“冷中暑”", "孙颖莎着急时 邱贻可及时“顺毛”", "十几个外甥暑假到舅舅家每天吃8斤米", "731部队常备40个活人用于实验", "特朗普：即将公布各国关税信函"]

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
